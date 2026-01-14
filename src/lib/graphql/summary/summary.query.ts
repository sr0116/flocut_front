// lib/graphql/summary/summary.query.ts
import { gql } from "@apollo/client";

//  공통 요약 단건 조회 
export const SUMMARY_VIEW_BY_ID_QUERY = gql`
  query DocumentSummaryViewBySummaryId($summaryId: ID!) {
    documentSummaryViewBySummaryId(summaryId: $summaryId) {
      summaryId
      mainTopic
      keyTakeaways
      sections {
        title
        content
      }
      finalDocument
    }
  }
`;

//  문서 요약 히스토리 
export const SUMMARY_HISTORY_QUERY = gql`
  query DocumentSummaryHistory(
    $fileId: ID!
    $sessionId: ID!
    $page: PageRequestInput!
  ) {
    documentSummaryHistory(
      fileId: $fileId
      sessionId: $sessionId
      page: $page
    ) {
      content {
        summaryId
        versionNo
        status
        createdAt
      }
      totalElements
      totalPages
      pageNumber
      pageSize
      hasNext
      hasPrevious
      isFirst
      isLast
    }
  }
`;

//  노트 요약 히스토리 (REST API 사용) 
// 백엔드에 GraphQL 쿼리가 없으므로 REST API로 대체