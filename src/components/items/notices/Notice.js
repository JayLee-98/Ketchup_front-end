import { useDispatch, useSelector } from "react-redux";
import { callDeleteNoticeAPI, callGetNoticeAPI } from "../../../apis/NoticeAPICalls";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ButtonGroup from "../../contents/ButtonGroup";
import FormatDate from "../../contents/FormatDate";
import DOMPurify from "isomorphic-dompurify"
import { decodeJwt } from "../../../utils/tokenUtils";

// 파일명 추출 함수
function getOriginalFileName(url) {
    const splitUrl = url.split('/');
    const filenameWithExtension = splitUrl[splitUrl.length - 1];
    const splitFilename = filenameWithExtension.split('.');
    return splitFilename[0];
}

function Notice({ noticeNo }) {

    console.log('Notice [ noticeNo ] : ', noticeNo);
    const dispatch = useDispatch();
    const notice = useSelector(state => state.noticeReducer.notice);
    const navigate = useNavigate();


    useEffect(() => {
        console.log('useEffect [ noticeNo ] : ', noticeNo)
        if (noticeNo) {
            dispatch(callGetNoticeAPI(noticeNo));
        }
    }, [dispatch, noticeNo]);



    const updateHandler = () => navigate(`/notices/update/${noticeNo}`);
    const deleteHandler = () => {
        dispatch(callDeleteNoticeAPI(noticeNo))
            .then(() => {
                alert('공지가 삭제되었습니다.');
                navigate(`/notices`);
            })
            .catch((error) => {
                console.error('공지 삭제 중 오류 발생:', error);
                // 에러가 발생했을 때 추가적인 처리를 수행하거나 사용자에게 알림을 표시할 수 있습니다.
            });
    }

    // notice가 정의되지 않았는지 확인한 후 속성에 액세스합니다.
    if (!notice) {
        return <div>로딩 중...</div>; // 또는 다른 적절한 로딩 표시기를 렌더링합니다.
    };

    const downloadFile = (fileName) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = `data:application/octet-stream;base64,${fileName.fileContent}`;
        downloadLink.download = getOriginalFileName(fileName);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const loginToken = decodeJwt(window.localStorage.getItem("accessToken"));
    console.log("loginToken : ", loginToken)
    return (
        // notice && (
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    { /* 로그인 된 상황에만 button이 보이도록 조건부 랜더링 */}
                    {/* { (loginStatus) &&  */}
                    {loginToken.role === 'LV2' || loginToken.role === 'LV3' && (
                        <ButtonGroup
                            buttons={[
                                { label: '수정', styleClass: 'back', onClick: updateHandler },
                                { label: '삭제', styleClass: 'move', onClick: deleteHandler }
                            ]}
                        />
                    )}
                    {/* } */}
                </div>
            </div>
            <div className="row">
                <div className="col-lg-12">

                    <h1>{notice.noticeTitle}</h1>

                    <div style={{ marginBottom: '30px' }}>

                        <img src={`/img/${notice.memberInfo.imgUrl}`} width="30" height="30" />&nbsp;
                        <span className="">{notice.memberInfo.memberName}</span>&nbsp;
                        <span>{notice.memberInfo.position.positionName}</span>&nbsp;&nbsp;
                        <span>{FormatDate(notice.noticeCreateDttm)}</span>
                    </div>

                    <div className="card-body">
                        {notice.noticeImgUrl && (
                            <div>
                                <img src={notice.noticeImgUrl} alt="Notice Image" className="file-image" />
                                <br />
                                <span>{getOriginalFileName(notice.noticeImgUrl)}</span> {/* 파일명이 보이도록 수정 */}
                                <br />
                                <button onClick={() => downloadFile(notice.noticeImgUrl)}>다운로드</button>
                            </div>
                        )}
                        {/* <a className="bi-file-earmark-pdf-fill"> [개발자료]가정의달  신제품 개발자료1.pdf </a><br />
                        <a className="bi-file-earmark-pdf-fill"> [개발자료]가정의달  신제품 개발자료2.pdf </a><br />
                        <a className="bi-file-earmark-pdf-fill"> [개발자료]가정의달  신제품 개발자료3.pdf </a> */}
                    </div>

                    <div style={{ marginTop: '30px', marginBottom: '100px' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notice.noticeContent) }}>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default Notice;