import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";


// HttpLink 인스턴스 생성 -> 통신
const link = new HttpLink({
    // 환경 변수 설정 (서버의 엔드 포인트)
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    // 쿠키나 인증헤어와 같은 사용자 인증 정보를 포함하도록 설정
    // 로그인 세션 유지 관련
    credentials: "include",
});

// ApolloClient 인스턴스 생성 및 내보내기
export const apolloClient = new ApolloClient({

    // 통신 연결 설정 -> Link를 가지고 서버 연결해서 통신
    link,
    // 캐시 설정 -> 클라이언트 메모리 내부에 데이터 저장
    // 중복 네트워크 요청을 줄이는데 사용되는 인메모리 캐시 사용
    // 리덕스의 store의 역할과 비슷함
    cache: new InMemoryCache(),
});
