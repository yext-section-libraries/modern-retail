import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  EntityField,
  getAggregateRating,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getThemeColorCssValue as resolveThemeColorCssValue,
  resolveComponentData,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  useDocument,
  VisibilityWrapper,
} from "@yext/visual-editor";

type ReviewComment = {
  content?: string;
  commentDate?: string;
};

type FirstPartyReview = {
  authorName?: string;
  rating?: number | string;
  content?: string;
  reviewDate?: string;
  comments?: ReviewComment[];
};

type FirstPartyAggregate = {
  publisher?: string;
  topReviews?: FirstPartyReview[];
};

type StreamDocumentShape = {
  locale?: string;
  ref_reviewsAgg?: FirstPartyAggregate[];
};

type SharedTextFieldValue = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type ModernRetailReviewsProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  cardBackgroundColor: ThemeColor;
  starColor?: ThemeColor;
  heading: SharedTextFieldValue;
};

const REVIEW_PUBLISHER_VALUE = "FIRSTPARTY" as const;

const resolveSurfaceForegroundColor = (
  surfaceColor?: ThemeColor,
): string | undefined =>
  resolveThemeColorCssValue(getDefaultForegroundColor(surfaceColor));

const defaultHeading: ModernRetailReviewsProps["heading"] = {
  text: {
    field: "",
    constantValue: {
      defaultValue: "What Customers Are Saying",
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  styles: {
    fontFamily: "default",
    fontSize: "44px",
    fontWeight: "700",
    fontStyle: "default",
    textTransform: "uppercase",
  },
};

const reviewsFields: YextFields<ModernRetailReviewsProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: "Visible on Live Page",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  heading: {
    label: "Heading",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  cardBackgroundColor: {
    label: "Card Background Color",
    type: "basicSelector",
    options: "BACKGROUND_COLOR",
  },
  starColor: {
    label: "Star Color",
    type: "basicSelector",
    options: "SITE_COLOR",
  },
};

const toFiniteNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const formatAverageRating = (value: unknown) => {
  const numericValue = toFiniteNumber(value);
  if (numericValue == null) return "";
  return numericValue % 1 === 0
    ? numericValue.toFixed(1)
    : numericValue.toFixed(1).replace(/\.0$/, "");
};

const formatReviewCountLabel = (value: unknown) => {
  const numericValue = toFiniteNumber(value);
  if (numericValue == null) return "";
  const roundedValue = Math.max(0, Math.round(numericValue));
  return `${roundedValue} ${roundedValue === 1 ? "Review" : "Reviews"}`;
};

const buildStarString = (value: unknown) => {
  const numericValue = toFiniteNumber(value);
  if (numericValue == null) return "";
  const filledStars = Math.max(0, Math.min(5, Math.round(numericValue)));
  return `${"★".repeat(filledStars)}${"☆".repeat(5 - filledStars)}`;
};

const formatRatingText = (value: unknown) => {
  const numericValue = toFiniteNumber(value);
  if (numericValue == null) return "";
  const displayValue =
    numericValue % 1 === 0
      ? numericValue.toFixed(0)
      : numericValue.toFixed(1).replace(/\.0$/, "");
  return `${displayValue}/5 stars`;
};

const formatReviewDate = (value: unknown, locale: string) => {
  if (typeof value !== "string" || value.trim().length === 0) return "";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate);
  } catch {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate);
  }
};

const placeholderSummary = {
  score: "4.7",
  stars: "★★★★★",
  reviewCountLabel: "142 Reviews",
};

const placeholderReviews = [
  {
    key: "placeholder-review-1",
    authorName: "Shachi C",
    stars: "★★★★★",
    ratingText: "5/5 stars",
    body: "I like this store. They have a big collection of designer clothes. The sales associates are all very friendly. Maya was very helpful and patient.",
    reviewDate: "",
  },
  {
    key: "placeholder-review-2",
    authorName: "Michael V",
    stars: "★★★★★",
    ratingText: "5/5 stars",
    body: "Great service! Extremely fast, was able to walk in no problem. Julian and Maya helped me out and were extremely friendly.",
    reviewDate: "",
  },
  {
    key: "placeholder-review-3",
    authorName: "Diana B",
    stars: "★★★★☆",
    ratingText: "4/5 stars",
    body: "Walked in to get styled for an event and the team was super helpful. We had to wait a bit, but they made sure we were taken care of.",
    reviewDate: "",
  },
];

const ModernRetailReviewsComponent: PuckComponent<ModernRetailReviewsProps> = (
  props,
) => {
  const streamDocument =
    (useDocument() as StreamDocumentShape | undefined) ?? {};
  const locale = streamDocument.locale ?? "en";
  const { averageRating, reviewCount } = getAggregateRating(
    streamDocument as any,
  );
  const firstPartyAggregate = Array.isArray(streamDocument.ref_reviewsAgg)
    ? streamDocument.ref_reviewsAgg.find(
        (aggregate) => aggregate?.publisher === REVIEW_PUBLISHER_VALUE,
      )
    : undefined;
  const resolvedHeadingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const sectionForeground =
    resolveSurfaceForegroundColor(props.section.backgroundColor);
  const cardForeground =
    resolveSurfaceForegroundColor(props.cardBackgroundColor) ?? sectionForeground;

  const topReviews = Array.isArray(firstPartyAggregate?.topReviews)
    ? firstPartyAggregate.topReviews
    : [];
  const score = formatAverageRating(averageRating);
  const summaryStars = buildStarString(averageRating);
  const reviewCountLabel = formatReviewCountLabel(reviewCount);

  const liveReviews = topReviews
    .map((review, index) => ({
      key: `${review.authorName || "review"}-${index}`,
      authorName: review.authorName?.trim() || "Anonymous",
      stars: buildStarString(review.rating),
      ratingText: formatRatingText(review.rating),
      body: typeof review.content === "string" ? review.content.trim() : "",
      reviewDate: formatReviewDate(review.reviewDate, locale),
    }))
    .filter((review) => review.body.length > 0 || review.ratingText.length > 0);

  if (!liveReviews.length && !props.puck.isEditing) return <></>;

  const showingEditorPlaceholders = !liveReviews.length && props.puck.isEditing;
  const displayedReviews = showingEditorPlaceholders
    ? placeholderReviews
    : liveReviews;
  const displayedScore = showingEditorPlaceholders
    ? placeholderSummary.score
    : score;
  const displayedSummaryStars = showingEditorPlaceholders
    ? placeholderSummary.stars
    : summaryStars;
  const displayedReviewCountLabel = showingEditorPlaceholders
    ? placeholderSummary.reviewCountLabel
    : reviewCountLabel;
  const summaryStarColor =
    resolveThemeColorCssValue(props.starColor) ?? sectionForeground;
  const cardStarColor =
    resolveThemeColorCssValue(props.starColor) ?? cardForeground;

  return (
    <AnalyticsScopeProvider
      name={`ModernRetailReviews${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{`
          .ps-reviews-layout {
            margin: 0 auto;
            max-width: 1200px;
            padding: 48px 16px;
          }
          .reviews-showcase {
            display: grid;
            gap: 24px;
          }
          .reviews-showcase__header {
            display: grid;
            justify-items: center;
            gap: 12px;
            margin-bottom: 0;
            text-align: center;
          }
          .reviews-showcase__summary {
            align-items: center;
            color: inherit;
            display: inline-flex;
            flex-wrap: wrap;
            font-family: "Roboto Mono", "Courier New", monospace;
            font-size: 16px;
            gap: 12px;
            justify-content: center;
            letter-spacing: 0.04em;
            line-height: 1;
          }
          .reviews-showcase__score,
          .reviews-showcase__count {
            align-items: center;
            color: currentColor;
            display: inline-flex;
            font-family: "Roboto Mono", "Courier New", monospace;
            font-size: 16px;
            line-height: 1;
            letter-spacing: 0.04em;
          }
          .reviews-showcase__stars {
            align-items: center;
            display: inline-flex;
            font-family: "Roboto Mono", "Courier New", monospace;
            font-size: 22px;
            letter-spacing: 0.08em;
            line-height: 1;
          }
          .reviews-showcase__summary .reviews-showcase__stars {
            font-size: 34px;
          }
          .reviews-showcase__divider {
            background: currentColor;
            height: 24px;
            width: 1px;
          }
          .reviews-showcase__list {
            display: grid;
            gap: 16px;
            margin: 0 auto;
            max-width: 800px;
            width: 100%;
          }
          .reviews-showcase__card {
            border: 1px solid currentColor;
            box-shadow: 0 16px 40px rgba(17, 17, 17, 0.06);
            display: grid;
            gap: 20px;
            padding: 32px;
          }
          .section-heading {
            font-family: "Roboto", sans-serif;
            font-size: clamp(28px, 3.4vw, 44px);
            font-style: normal;
            font-weight: 700;
            letter-spacing: -0.04em;
            line-height: 1.08;
            text-transform: uppercase;
          }
          .reviews-showcase__card-header {
            align-items: center;
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            justify-content: space-between;
          }
          .reviews-showcase__name {
            color: inherit;
            font-family: "Roboto", sans-serif;
            font-size: 28px;
            font-style: normal;
            font-weight: 700;
            letter-spacing: -0.02em;
            line-height: 0.98;
          }
          .reviews-showcase__rating {
            align-items: center;
            display: inline-flex;
            flex-wrap: wrap;
            gap: 12px;
          }
          .reviews-showcase__rating-text {
            color: currentColor;
            font-family: "Roboto Mono", "Courier New", monospace;
            font-size: 16px;
            font-weight: 400;
            letter-spacing: 0.04em;
            line-height: 1.4;
          }
          .reviews-showcase__text {
            color: currentColor;
            font-size: 18px;
            line-height: 1.6;
            margin: 0;
            max-width: 78rem;
          }
          @media (max-width: 1024px) {
            .reviews-showcase__card {
              padding: 24px;
            }
            .reviews-showcase__name {
              font-size: 32px;
            }
            .reviews-showcase__text {
              max-width: none;
            }
          }
          @media (min-width: 750px) and (max-width: 1024px) {
            .reviews-showcase__card-header {
              align-items: center;
              flex-wrap: nowrap;
            }
            .reviews-showcase__rating {
              flex-shrink: 0;
              flex-wrap: nowrap;
              white-space: nowrap;
            }
            .reviews-showcase__rating-text {
              white-space: nowrap;
            }
          }
          @media (max-width: 749px) {
            .reviews-showcase__summary {
              gap: 8px 12px;
            }
            .reviews-showcase__score,
            .reviews-showcase__count {
              font-size: 18px;
            }
            .reviews-showcase__stars {
              font-size: 19px;
            }
            .reviews-showcase__summary .reviews-showcase__stars {
              font-size: 19px;
            }
            .reviews-showcase__divider {
              display: none;
            }
            .reviews-showcase__card-header {
              align-items: flex-start;
              flex-direction: column;
            }
            .reviews-showcase__name {
              font-size: 30px;
            }
            .reviews-showcase__text {
              font-size: 17px;
            }
          }
        `}</style>
        <section
          id="theme-section-template--25351194706234__section_reviews"
          className="theme-section"
          style={{
            backgroundColor: resolveThemeColorCssValue(props.section.backgroundColor),
            color: sectionForeground,
          }}
        >
          <div className="ps-reviews-layout color-scheme-1">
            <div className="reviews-showcase">
              <div className="section-layout-header reviews-showcase__header">
                <EntityField
                  displayName="Heading"
                  fieldId={props.heading.text.field}
                  constantValueEnabled={props.heading.text.constantValueEnabled}
                >
                  <h2
                    className="section-heading inline-richtext h2 heading-color text-uppercase heading-font"
                    style={{
                      color: sectionForeground,
                      fontFamily:
                        props.heading.styles.fontFamily === "default"
                          ? undefined
                          : props.heading.styles.fontFamily,
                      fontSize:
                        props.heading.styles.fontSize === "default"
                          ? undefined
                          : props.heading.styles.fontSize,
                      fontStyle:
                        props.heading.styles.fontStyle === "default"
                          ? undefined
                          : props.heading.styles.fontStyle,
                      fontWeight:
                        props.heading.styles.fontWeight === "default"
                          ? undefined
                          : props.heading.styles.fontWeight,
                      margin: 0,
                      textTransform:
                        props.heading.styles.textTransform === "default"
                          ? undefined
                          : props.heading.styles.textTransform,
                    }}
                  >
                    {resolvedHeadingText}
                  </h2>
                </EntityField>
                {showingEditorPlaceholders ? (
                  <div
                    style={{
                      border: "1px dashed currentColor",
                      color: "currentColor",
                      fontFamily: undefined,
                      fontSize: "14px",
                      lineHeight: 1.5,
                      marginTop: "4px",
                      maxWidth: "800px",
                      padding: "16px",
                    }}
                  >
                    No first-party reviews available for this entity yet.
                    Showing editor placeholder content.
                  </div>
                ) : null}
                {displayedScore && displayedReviewCountLabel ? (
                  <div
                    aria-label={`${displayedScore} out of 5 stars based on ${displayedReviewCountLabel}`}
                    className="reviews-showcase__summary"
                  >
                    <span className="reviews-showcase__score">
                      {displayedScore}
                    </span>
                    <span
                      aria-hidden
                      className="reviews-showcase__stars"
                      style={{ color: summaryStarColor }}
                    >
                      {displayedSummaryStars}
                    </span>
                    <span aria-hidden className="reviews-showcase__divider" />
                    <span className="reviews-showcase__count">
                      {displayedReviewCountLabel}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="reviews-showcase__list">
                {displayedReviews.map((review) => (
                  <article
                    key={review.key}
                    className="reviews-showcase__card background-secondary"
                    style={{
                      backgroundColor: resolveThemeColorCssValue(props.cardBackgroundColor),
                      color: cardForeground,
                    }}
                  >
                    <div className="reviews-showcase__card-header">
                      <h3
                        className="reviews-showcase__name heading-font"
                        style={{ margin: 0 }}
                      >
                        {review.authorName}
                      </h3>
                      <div className="reviews-showcase__rating">
                        {review.stars ? (
                          <span
                            aria-hidden
                            className="reviews-showcase__stars"
                            style={{ color: cardStarColor }}
                          >
                            {review.stars}
                          </span>
                        ) : null}
                        {review.ratingText || review.reviewDate ? (
                          <span className="reviews-showcase__rating-text">
                            {[review.ratingText, review.reviewDate]
                              .filter((value) => value.length > 0)
                              .join(" | ")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {review.body ? (
                      <p className="reviews-showcase__text">{review.body}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const ModernRetailReviews: YextComponentConfig<ModernRetailReviewsProps> =
  {
    label: "Reviews",
    fields: reviewsFields,
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "palette-quaternary",
        },
      },
      cardBackgroundColor: {
        selectedColor: "white",
        contrastingColor: "palette-quaternary",
      },
      heading: defaultHeading,
    },
    render: (props) => <ModernRetailReviewsComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "ModernRetailReviews",
  displayName: "Reviews",
  description: "Reviews",
  pageSetTypes: ["ENTITY"],
};
