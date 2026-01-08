// import {useQuery} from "@apollo/client/react";
// import {DOCUMENT_LATEST_SUMMARY_BY_FILE_QUERY} from "@/lib/graphql/summary/summary.query";
//
//
//
// 현재 바뀔 수도 있어서 임시 주석
// //  파일 아이디 기준 최신 요약 조회 훅
// // 문서 화면 전용
// //요약 요청 후 polling 가능
//
//
// export function useLatestSummaryByFile(fileId: number) {
//     const { data, loading, error, refetch } = useQuery<{
//         documentLatestSummaryByFile: DocumentSummaryView;
//     }>(DOCUMENT_LATEST_SUMMARY_BY_FILE_QUERY, {
//         variables: { fileId },
//         skip: !fileId,
//         pollInterval: 3000,
//     });
//
//     return {
//         summary: data?.documentLatestSummaryByFile ?? null,
//         loading,
//         error,
//         refetch,
//     };
// }