import 'bootstrap-icons/font/bootstrap-icons.css';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import InsertCommentForm from '../../form/InsertCommentForm';
import { decodeJwt } from '../../../utils/tokenUtils';
import { callDeleteCommentAPI, callGetCommentListAPI } from '../../../apis/CommentAPICalls';
import FormatDate from '../../contents/FormatDate';
import { Dialog, Typography } from '@mui/material';
import { Box } from '@mui/system';
import ButtonGroup from '../../contents/ButtonGroup';
import './Comment.css'; // CSS 파일을 import

function Comment({ boardNo }) {
    console.log("Comment [ boardNo ] : ", boardNo);
    const dispatch = useDispatch();
    const result = useSelector(state => state.commentReducer);
    const commentList = result.commentlist || [];
    const loginToken = decodeJwt(window.localStorage.getItem("accessToken"));
    const [loading, setLoading] = useState(true);       // 목록 로딩 상태 관리
    const [replyTo, setReplyTo] = useState(null);       // 답글 memberNo
    const [replyName, setReplyName] = useState(null);   // 답글 memberName
    const [deleteModal, setDeleteModal] = useState(false);  // 삭제 모달 상태
    const [selectedCommentNo, setSelectedCommentNo] = useState(null); // 삭제할 댓글 번호

    console.log("commentList : ", commentList);

    useEffect(() => {
        if (boardNo) {
            dispatch(callGetCommentListAPI({ boardNo }))
                .then(() => {
                    setLoading(false);  // 목록 로딩이 완료 시 false
                })
                .catch((error) => {
                    console.error('Error fetching comment list:', error);
                    setLoading(false);
                });
        }
    }, [dispatch, boardNo]);

    const openDeleteModal = (commentNo) => {
        setSelectedCommentNo(commentNo);
        setDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setSelectedCommentNo(null);
        setDeleteModal(false);
    };

    const deleteHandler = () => {
        if (selectedCommentNo) {
            dispatch(callDeleteCommentAPI({ boardNo, commentNo: selectedCommentNo }))
                .then(() => {
                    // 댓글 삭제 후 바로 목록을 다시 불러옵니다.
                    dispatch(callGetCommentListAPI({ boardNo }))
                        .catch((error) => {
                            console.error('Error fetching comment list:', error);
                        });
                    closeDeleteModal();
                })
                .catch((error) => {
                    console.error('Error deleting comment:', error);
                    closeDeleteModal();
                });
        }
    };

    const handleReplyClick = (comment) => {
        // 답글 대상 설정
        if (comment.memberName) {
            setReplyName(comment.memberName);
            setReplyTo(comment.commentNo);
        }
    };

    const renderComment = (comment) => {
        const parentComment = commentList.find(parent => parent.commentNo === comment.parentCommentNo);
        const parentMemberName = parentComment ? parentComment.memberName : null;

        const formattedComment = {
            ...comment,
            commentCreateDt: FormatDate(comment.commentCreateDt),
            parentMemberName: parentMemberName
        };

        // 서버에서 받은 삭제 여부 상태를확인 
        const isDeleted = comment.deleteComment;

        return (
            <div key={comment.commentNo} className="comment-container"> {/* Comment.css에서 정의한 클래스 */}
                <div className="comment-inner">
                    <div className='float-left' style={{ marginLeft: formattedComment.parentMemberName ? '10px' : 'none',  borderTop: 'none' }}>
                        <span>{formattedComment.memberName} {formattedComment.positionName}</span>&nbsp;&nbsp;
                        <span>{formattedComment.commentCreateDt}</span>
                    </div>
                    <div className='float-right'>
                        <button className='text-btn' onClick={() => handleReplyClick(comment)}>답글</button>
                        {loginToken.memberNo === comment.memberNo && (
                            <button className='text-btn' onClick={() => openDeleteModal(comment.commentNo)}>삭제</button>
                        )}
                    </div>
                    <br />
                    {isDeleted ? (
                        <div style={{ marginTop: "5px", marginBottom: '5px', color: 'red' }}>
                            <span>삭제된 댓글입니다.</span>
                        </div>
                    ) : (
                        <div style={{ marginTop: "5px", marginBottom: '5px' }}>
                            {formattedComment.parentMemberName ? (
                                <span style={{ marginLeft: '10px'}} className="parent-member">@{formattedComment.parentMemberName} </span>
                            ) : null}
                            <span>{formattedComment.commentContent}</span>
                        </div>
                    )}
                </div>
                {/* 대댓글이 있는 경우에만 렌더링 */}
                {comment.replies && comment.replies.length > 0 && (
                    <div>
                        {comment.replies.map(reply => renderComment(reply))}
                    </div>
                )}
            </div>
        );
    };

    const handleCommentSubmit = () => {
        dispatch(callGetCommentListAPI({ boardNo }))
            .catch(error => {
                console.error('Error fetching comment list:', error);
            });
    };

    return (
        <>
            {loading ? ( // 로딩 중이면 로딩 메시지를 표시합니다.
                <div style={{ marginTop: "5px", marginBottom: '5px' }}>댓글을 불러오는 중입니다...</div>
            ) : (
                commentList && commentList.length > 0 ? (
                    commentList.filter(comment => comment.parentCommentNo === null).map(comment => renderComment(comment)) // 부모 댓글만 필터링하여 렌더링
                ) : (
                    <div style={{ marginTop: "5px", marginBottom: '5px' }}>
                    &nbsp; 댓글이 없습니다.
                    </div>
                )
            )}

            <InsertCommentForm boardNo={boardNo} onCommentSubmit={handleCommentSubmit} replyTo={replyTo} replyName={replyName} />

            <Dialog open={deleteModal} onClose={closeDeleteModal}>
                <Box p={6} justifyContent="flex-end" padding="40px" paddingBottom="20px">
                    <Typography variant="body1">댓글은 삭제 후 복구할 수 없습니다.</Typography>
                    <Typography variant="body1">정말 삭제하시겠습니까?</Typography>
                    <br />
                    <ButtonGroup
                        buttons={[
                            { label: '취소', styleClass: 'back', onClick: closeDeleteModal },
                            { label: '삭제', styleClass: 'move', onClick: deleteHandler }
                        ]}
                    />
                </Box >
            </Dialog>
        </>
    );
}

export default Comment;
