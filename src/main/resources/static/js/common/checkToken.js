//토큰을 토컬 스토리지에 저장
function saveTokenToLocalStorage(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
}

//토큰을 토컬 스토리지에서 삭제
function removeTokenInLocalStorage() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

//payload에서 데이터 가져오기
function getPayloadData(accessToken) {
    //토큰이 없는 경우 null 반환
    if (!accessToken) {
        return null;
    }
    //토큰의 payload 부분 추출
    var base64Payload = token.split('.')[1];    //value 0: header, 1: payload, 2: VERIFY SIGNATURE
    //base64 디코딩 및 JSON 객체로 변환
    return JSON.parse(atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')));
}

//토큰 만료 시간 확인
function getTokenExpirationDate(exp) {
    //UNIX 시간 스탬프를 밀리초 단위로 변환
    const milliseconds = exp * 1000;

    //밀리초를 기반으로 Date 객체 생성
    const date = new Date(milliseconds);

    //Date 객체를 사용하여 날짜 및 시간 표시
    console.log("토큰 만료 시간:"+date);
}

//새로운 access token을 요청하는 함수
function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        return Promise.reject('Refresh token을 찾을 수 없습니다.');
    }

    //TokenRequestDto 객체 생성
    const tokenReq = {
        refreshToken: localStorage.getItem('refreshToken')
    };

    //refresh 요청
    return axios.post('/auth/refresh', tokenReq)
        .then(function(response) {
            console.log('Access token 재발급 성공');
            //새로운 access token 발급
            const { accessToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
        })
        .catch(function(error) {
            console.error('Access token 재발급 실패:', error);
            removeTokenInLocalStorage();
        });
}

/*토큰 만료 여부 검사, refresh 요청 함수*/
function checkTokenExpiration() {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        const payload = getPayloadData(accessToken);
        getTokenExpirationDate(payload.exp);
        //토큰 있는 경우: 로그인 상태
        const tokenExpiration = payload.exp * 1000; //밀리초 단위로 변환
        const currentTime = Date.now();
        if (tokenExpiration && tokenExpiration <= currentTime) {
            console.log("토큰 만료")
            //토큰 만료된 경우: 로그아웃 처리
            localStorage.removeItem('accessToken');
            //access token 재발급 OR refresh token 삭제
            refreshAccessToken();
        }
    }
}

/*페이지 로드 시 토큰 만료 검사 실행*/
document.addEventListener('DOMContentLoaded', function() {
    checkTokenExpiration();
});