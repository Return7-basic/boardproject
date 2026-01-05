# 변경 사항 정리 (Change Log)

## 📋 개요
이번 세션에서 댓글 수정/삭제 실시간 반영, 게시글 페이지네이션 오류 수정, soft delete 개선 등의 기능을 구현했습니다.

---

## 🔧 백엔드 변경 사항

### 1. **ReplyRepository.java** (`board-backend/src/main/java/return7/boardbackend/repository/ReplyRepository.java`)

#### 추가된 메서드:
- **`countByParentIdAndIsDeletedFalse(Long parentId)`**
  - 특정 부모 댓글의 삭제되지 않은 자식 댓글 개수를 조회
  - 부모 댓글의 hard delete 여부를 판단하기 위해 사용

- **`findAllDeletedReplies()`**
  - soft delete된 모든 댓글을 조회
  - cleanup 기능에서 사용

```java
@Query("SELECT COUNT(r) FROM Reply r WHERE r.parent.id = :parentId AND r.isDeleted = false")
long countByParentIdAndIsDeletedFalse(@Param("parentId") Long parentId);

@Query("SELECT r FROM Reply r WHERE r.isDeleted = true")
List<Reply> findAllDeletedReplies();
```

---

### 2. **ReplyService.java** (`board-backend/src/main/java/return7/boardbackend/service/ReplyService.java`)

#### 변경된 메서드:

**`delete()` 메서드 개선:**
- **Soft delete 로직**: 자식 댓글이 있는 경우 soft delete 수행
- **Hard delete 로직**: 자식 댓글이 없거나 모두 삭제된 경우 hard delete 수행
- **부모 댓글 자동 삭제**: soft delete된 부모 댓글의 모든 자식이 삭제되면 부모도 자동으로 hard delete

```java
// 부모가 soft delete된 상태이고, 모든 자식이 삭제되었다면 부모도 hard delete
if (parentId != null) {
    Optional<Reply> parentOptional = replyRepository.findById(parentId);
    if (parentOptional.isPresent()) {
        Reply parentReply = parentOptional.get();
        if (parentReply.isDeleted()) {
            long notDeletedChildrenCount = replyRepository.countByParentIdAndIsDeletedFalse(parentId);
            if (notDeletedChildrenCount == 0) {
                replyRepository.delete(parentReply);
            }
        }
    }
}
```

**`getSelectedReply()` 메서드 변경:**
- 반환 타입을 `ResponseReplyDto`에서 `Optional<ResponseReplyDto>`로 변경
- 채택된 댓글이 없을 때 예외 대신 `Optional.empty()` 반환

```java
@Transactional(readOnly = true)
public Optional<ResponseReplyDto> getSelectedReply(Long boardId) {
    boardRepository.findById(boardId)
            .orElseThrow(() -> new BoardNotFoundException("게시물을 찾을 수 없습니다."));

    return replyRepository.findByBoardIdAndIsSelectedTrue(boardId)
            .map(ResponseReplyDto::from);
}
```

#### 추가된 메서드:

**`cleanupDeletedReplies()` 메서드:**
- soft delete된 댓글들 중 자식이 모두 삭제된 댓글들을 완전히 삭제
- 데이터 정리용으로 사용

```java
@Transactional
public int cleanupDeletedReplies() {
    List<Reply> deletedReplies = replyRepository.findAllDeletedReplies();
    int deletedCount = 0;
    
    for (Reply deletedReply : deletedReplies) {
        long notDeletedChildrenCount = replyRepository.countByParentIdAndIsDeletedFalse(deletedReply.getId());
        if (notDeletedChildrenCount == 0) {
            replyRepository.delete(deletedReply);
            deletedCount++;
        }
    }
    
    return deletedCount;
}
```

---

### 3. **ReplyController.java** (`board-backend/src/main/java/return7/boardbackend/controller/ReplyController.java`)

#### 변경된 엔드포인트:

**`getSelectedReply()` 엔드포인트:**
- `Optional<ResponseReplyDto>`를 처리하여 채택된 댓글이 없을 때 404 반환

```java
@GetMapping("/selected")
public ResponseEntity<ResponseReplyDto> getSelectedReply (@PathVariable Long boardId) {
    return replyService.getSelectedReply(boardId)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
}
```

#### 추가된 엔드포인트:

**`cleanupDeletedReplies()` 엔드포인트:**
- 관리자만 사용 가능한 cleanup API
- 자식이 모두 삭제된 soft delete 댓글들을 완전히 삭제

```java
@PostMapping("/cleanup")
public ResponseEntity<Integer> cleanupDeletedReplies(
        @PathVariable Long boardId,
        @AuthenticationPrincipal CustomPrincipal customPrincipal) {
    boolean isAdmin = customPrincipal.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    if (!isAdmin) {
        return ResponseEntity.status(403).build();
    }
    
    int deletedCount = replyService.cleanupDeletedReplies();
    return ResponseEntity.ok(deletedCount);
}
```

---

### 4. **ResponseReplyDto.java** (`board-backend/src/main/java/return7/boardbackend/dto/reply/ResponseReplyDto.java`)

#### 변경 사항:
- `isDeleted` 필드에 `@JsonProperty("isDeleted")` 어노테이션 추가
- JSON 직렬화 시 필드명 일관성 보장

```java
@JsonProperty("isDeleted")
private boolean isDeleted;
```

---

### 5. **BoardService.java** (`board-backend/src/main/java/return7/boardbackend/service/BoardService.java`)

#### 변경된 메서드:

**`findAll()` 메서드:**
- 반환 타입을 `List<BoardDto>`에서 `BoardListResponseDto`로 변경
- `Page<Board>`를 사용하여 `hasNext` 정보 제공

```java
@Transactional(readOnly = true)
public BoardListResponseDto findAll(int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
    Page<Board> boardPage = boardRepository.findAll(pageable);
    
    List<BoardDto> boardDtos = boardPage.getContent()
            .stream()
            .map(BoardDto::from)
            .collect(Collectors.toList());
    
    boolean hasNext = boardPage.hasNext();
    
    return new BoardListResponseDto(boardDtos, hasNext);
}
```

---

### 6. **BoardController.java** (`board-backend/src/main/java/return7/boardbackend/controller/BoardController.java`)

#### 변경된 엔드포인트:

**`getBoards()` 엔드포인트:**
- 반환 타입을 `List<BoardDto>`에서 `BoardListResponseDto`로 변경

```java
@GetMapping
public BoardListResponseDto getBoards(
        @RequestParam(defaultValue = "0")int page,
        @RequestParam(defaultValue = "10") int size
){
    return boardService.findAll(page,size);
}
```

---

### 7. **BoardListResponseDto.java** (신규 파일)

#### 추가된 DTO:
- 게시글 목록과 페이지네이션 정보를 함께 반환하는 DTO

```java
public record BoardListResponseDto(
    List<BoardDto> items,
    boolean hasNext
) {}
```

---

## 🎨 프론트엔드 변경 사항

### 1. **useReplies.js** (`board-frontend/src/hooks/useReplies.js`)

#### 변경된 훅:

**`useUpdateReply()` 훅:**
- `onSuccess`에서 `setQueryData`를 사용하여 즉시 UI 업데이트
- `replies`와 `selectedReply` 쿼리 데이터를 직접 수정
- 새로고침 없이 댓글 수정 내용이 즉시 반영

```javascript
onSuccess: (updatedReply, variables) => {
    // 실시간 UI 업데이트
    queryClient.setQueryData(['replies', boardId], (oldData) => {
        // 평면 배열에서 해당 댓글 찾아서 업데이트
        const updatedPages = oldData.pages.map((page) => {
            const itemIndex = page.items.findIndex(item => item.id === updatedReply.id);
            if (itemIndex === -1) return { ...page };
            
            const updatedItems = [...page.items];
            updatedItems[itemIndex] = { ...updatedReply };
            
            return { ...page, items: updatedItems };
        });
        
        return { ...oldData, pages: updatedPages };
    });
    
    // 채택된 댓글도 갱신
    queryClient.setQueryData(['selectedReply', boardId], (oldSelectedReply) => {
        if (oldSelectedReply && oldSelectedReply.id === updatedReply.id) {
            return { ...updatedReply };
        }
        return oldSelectedReply;
    });
}
```

**`useDeleteReply()` 훅:**
- Soft delete 시 `setQueryData`로 즉시 UI 업데이트
- Hard delete 시 (204 응답) 전체 쿼리 무효화

```javascript
onSuccess: (response, replyId) => {
    if (response.status === 204) {
        // hard delete - 전체 목록 갱신
        queryClient.invalidateQueries({ queryKey: ['replies', boardId] });
        queryClient.invalidateQueries({ queryKey: ['selectedReply', boardId] });
    } else {
        // soft delete - 평면 배열에서 직접 업데이트
        const deletedReply = response.data;
        queryClient.setQueryData(['replies', boardId], (oldData) => {
            // 해당 댓글을 deletedReply로 교체
            const updatedPages = oldData.pages.map((page) => {
                const itemIndex = page.items.findIndex(item => item.id === replyId);
                if (itemIndex === -1) return { ...page };
                
                const updatedItems = [...page.items];
                updatedItems[itemIndex] = { ...deletedReply };
                
                return { ...page, items: updatedItems };
            });
            
            return { ...oldData, pages: updatedPages };
        });
    }
}
```

**`useUpVoteReply()` / `useDownVoteReply()` 훅:**
- 낙관적 업데이트(Optimistic Update) 적용
- 댓글 작성 직후 추천/비추천 시에도 정상 작동하도록 개선
- 댓글이 캐시에 없을 경우 쿼리 무효화로 재조회

```javascript
onSuccess: (voteType, replyId, context) => {
    if (voteType === 'CANCEL' && context?.previousReplies) {
        // 취소 시 이전 상태로 롤백
        queryClient.setQueryData(['replies', boardId], context.previousReplies);
        queryClient.setQueryData(['selectedReply', boardId], context.previousSelected);
    } else {
        // 댓글이 캐시에 없으면 재조회 (댓글 작성 직후 추천/비추천 시)
        const currentData = queryClient.getQueryData(['replies', boardId]);
        const replyExists = currentData?.pages?.some(page =>
            page.items?.some(item => item.id === replyId)
        );
        if (!replyExists) {
            queryClient.invalidateQueries({ queryKey: ['replies', boardId] });
            queryClient.invalidateQueries({ queryKey: ['selectedReply', boardId] });
        }
    }
}
```

---

### 2. **ReplyItem.js** (`board-frontend/src/components/reply/ReplyItem.js`)

#### 변경 사항:

**`isDeleted` 상태 확인:**
- `reply.isDeleted === true`로 명시적으로 확인
- `reply.content === '삭제된 댓글입니다.'` 방식에서 변경

```javascript
const isDeleted = reply.isDeleted === true;
```

**조건부 렌더링:**
- `isDeleted`가 `true`일 때 "삭제된 댓글입니다." 메시지 표시
- 삭제된 댓글에는 수정/삭제/답글 버튼 숨김

```javascript
{isEditing ? (
    // 편집 폼
) : (
    <div className="mb-4">
        <p className={`text-slate-300 whitespace-pre-wrap ${isDeleted ? 'italic text-slate-500' : ''}`}>
            {isDeleted ? '삭제된 댓글입니다.' : reply.content}
        </p>
    </div>
)}

{!isEditing && !isDeleted && (
    // 액션 버튼들 (수정, 삭제, 답글, 채택)
)}
```

---

### 3. **ReplyList.js** (`board-frontend/src/components/reply/ReplyList.js`)

#### 변경 사항:

**`handleUpdate()` 함수:**
- 단순히 `updateReply(data)` 호출
- UI 업데이트는 `useUpdateReply` 훅의 `onSuccess`에서 처리

```javascript
const handleUpdate = (data) => {
    updateReply(data);
};
```

---

### 4. **BoardList.js** (`board-frontend/src/components/board/BoardList.js`)

#### 변경 사항:

**페이지네이션 로직 개선:**
- `useBoards(page, size)` 호출 시 `size + 1` 대신 `size`만 전달
- `hasNextPage`는 백엔드에서 제공하는 `hasNext` 필드 사용
- 빈 목록 메시지는 `page === 0`이고 `displayBoards.length === 0`일 때만 표시

```javascript
// 정확히 size개만 요청 (백엔드에서 hasNext 정보 제공)
const { data: boardData, isLoading, isError, error } = useBoards(page, size);

// 실제 표시할 게시글
const displayBoards = boardData?.items || [];
// 다음 페이지가 있는지 확인 (백엔드에서 제공)
const hasNextPage = boardData?.hasNext || false;

// 빈 목록 (page가 0이고 게시글이 없을 때만)
if (page === 0 && (!displayBoards || displayBoards.length === 0)) {
    // "아직 등록된 질문이 없습니다" 메시지 표시
}
```

---

### 5. **useBoards.js** (`board-frontend/src/hooks/useBoards.js`)

#### 변경 사항:

**`useBoards()` 훅:**
- `BoardListResponseDto` 형태의 데이터를 반환받도록 변경
- `items`와 `hasNext` 필드를 포함

```javascript
export function useBoards(page = 0, size = 10) {
    return useQuery({
        queryKey: ['boards', page, size],
        queryFn: () => getBoards(page, size),
    });
}
```

---

### 6. **replies.js** (`board-frontend/src/api/replies.js`)

#### 변경 사항:

**`getSelectedReply()` 함수:**
- 404 에러를 catch하여 `null` 반환
- 채택된 댓글이 없을 때 예외 대신 `null` 처리

```javascript
export const getSelectedReply = async (boardId) => {
    try {
        const response = await api.get(`/api/boards/${boardId}/replies/selected`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log('채택된 댓글이 없습니다 (404).');
            return null; // 404 에러 시 null 반환
        }
        throw error;
    }
};
```

---

## 📝 추가된 파일

### 1. **cleanup_deleted_replies.sql** (프로젝트 루트)
- Soft delete된 댓글들을 정리하는 SQL 스크립트
- 데이터베이스 직접 조작 시 참고용

---

## 🐛 해결된 문제들

1. ✅ **댓글 수정 후 반영이 바로 되지 않음**
   - `useUpdateReply` 훅에서 `setQueryData`로 즉시 UI 업데이트

2. ✅ **실시간 댓글 추천 반영이 바로 되지 않음**
   - `useUpVoteReply` / `useDownVoteReply` 훅에 낙관적 업데이트 적용

3. ✅ **본인 댓글에 대한 대댓글 버튼이 없음**
   - `ReplyItem.js`에서 본인 댓글에도 답글 버튼 표시

4. ✅ **대댓글 가지고있는 댓글 삭제시 soft 삭제 반영안됨**
   - `useDeleteReply` 훅에서 `setQueryData`로 즉시 UI 업데이트

5. ✅ **대댓글 가지고 있는 댓글 수정시 수정 반영 안됨**
   - `useUpdateReply` 훅에서 평면 배열에서 직접 업데이트

6. ✅ **게시글 10개인 상태에서 다음버튼이 활성화 되어있음**
   - 백엔드에서 `hasNext` 정보 제공, 프론트엔드에서 정확히 사용

7. ✅ **11개 게시글 시 2페이지에 게시글이 보이지 않음**
   - 페이지네이션 로직 개선 (`size + 1` 제거, `hasNext` 사용)

8. ✅ **"아직 등록된 질문이 없습니다" 메시지가 잘못 표시됨**
   - `page === 0`이고 게시글이 없을 때만 표시하도록 수정

9. ✅ **댓글 작성 직후 추천/비추천이 반영되지 않음**
   - 댓글이 캐시에 없을 경우 쿼리 무효화로 재조회

10. ✅ **부모 댓글이 soft delete된 상태에서 자식 모두 삭제 시 부모도 완전 삭제**
    - `ReplyService.delete()` 메서드에서 자동 처리

11. ✅ **채택된 댓글 조회 API 404 에러**
    - `getSelectedReply`에서 404를 catch하여 `null` 반환

12. ✅ **isDeleted 필드가 프론트엔드에서 반영되지 않음**
    - `@JsonProperty("isDeleted")` 추가 및 프론트엔드에서 명시적 확인

---

## 🎯 주요 개선 사항

1. **실시간 UI 업데이트**: 새로고침 없이 모든 변경사항이 즉시 반영
2. **낙관적 업데이트**: 추천/비추천 시 즉시 UI 반영 후 서버 응답 대기
3. **정확한 페이지네이션**: 백엔드에서 `hasNext` 정보 제공으로 정확한 페이지네이션
4. **자동 데이터 정리**: 부모 댓글의 모든 자식이 삭제되면 부모도 자동 삭제
5. **에러 처리 개선**: 404 에러를 graceful하게 처리

---

## 📌 사용 방법

### Cleanup API 사용 (관리자만 가능)
```bash
POST http://localhost:8080/api/boards/{boardId}/replies/cleanup
```

응답 예시:
```json
5  // 삭제된 댓글 개수
```

---

## ⚠️ 주의사항

1. **Cleanup API**는 관리자 권한이 필요합니다.
2. **SQL 스크립트**를 실행하기 전에 데이터베이스를 백업하세요.
3. **MySQL**에서는 동일한 테이블을 참조하는 DELETE 쿼리가 제한될 수 있습니다.

