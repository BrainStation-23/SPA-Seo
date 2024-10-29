import { Grid, LegacyCard, IndexTable, Text } from "@shopify/polaris";
import React from "react";
import { useErrorInsightsQuery } from "../hooks/useErrorInsightsQuery";
import { formattedDate } from "../utils";
import { Spinners } from "./Spinner";
import { IndexTableData } from "./commonUI/IndexTable";

export function ErrorList() {
  const { data, isSuccess, isLoading } = useErrorInsightsQuery({
    url: "/api/error/insights",
  });

  if (isLoading) return <Spinners />;

  const rowMarkup =
    (data &&
      data?.errorList?.map((info, index) => (
        <IndexTable.Row id={index} key={index} position={index}>
          <IndexTable.Cell>
            <Text as="span">{info?.url}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span">{info?.timestamp && formattedDate(info?.timestamp)}</Text>
          </IndexTable.Cell>
        </IndexTable.Row>
      ))) ||
    [];

  const headings = [{ title: "URL" }, { title: "Date" }];

  const resourceName = {
    singular: "Error",
    plural: "Errors",
  };

  return (
    <div className="seo_error_list_container">
      <div className="seo_error_insights_options">
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
            <LegacyCard title="Total Errors For 404" sectioned>
              <p>
                <b>Counts: </b>
                {data?.totalVisits}
              </p>
              <p style={{ opacity: "0" }}>0</p>
            </LegacyCard>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
            <LegacyCard title="Total Unique URL visits (404)" sectioned>
              <p>
                <b>Counts: </b>
                {data?.uniqueUrlsCount}
              </p>
              <p style={{ opacity: "0" }}>0</p>
            </LegacyCard>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
            <LegacyCard title="Most Frequent URL visits (404)" sectioned>
              <p>
                <b>URL:</b> {data?.mostFrequentOne?.url}
              </p>
              <p>
                <b>Counts:</b> {data?.mostFrequentOne?.count}
              </p>
            </LegacyCard>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
            <LegacyCard title="Last time visited URL (404)" sectioned>
              <p>
                <b>URL:</b> {data?.lastVisit?.url}
              </p>
              <p>
                <b>Date: </b>
                {isSuccess && data?.lastVisit?.timestamp && formattedDate(data?.lastVisit?.timestamp)}
              </p>
            </LegacyCard>
          </Grid.Cell>
        </Grid>
      </div>
      <div className="seo_error_list">
        <div className="seo_error_list_title">404 Error list</div>
        <IndexTableData isLoading={isLoading} rowMarkup={rowMarkup} headings={headings} resourceName={resourceName} />
      </div>
    </div>
  );
}
