import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  ComprehensiveCTA,
  EntityField,
  getDefaultRTF,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getThemeColorCssValue as resolveThemeColorCssValue,
  Image,
  MaybeRTF,
  resolveComponentData,
  type ComprehensiveCTAValue,
  type RichText,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
  ThemeOptions,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  useDocument,
  VisibilityWrapper,
} from "@yext/visual-editor";

type StreamDocumentShape = {
  locale?: string;
};

type SharedTextFieldValue = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type SharedRichTextFieldValue = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type SharedImageFieldValue = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type ModernRetailCommunityProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  sectionImage: SharedImageFieldValue;
  heading: SharedTextFieldValue;
  body: SharedRichTextFieldValue;
  cta: ComprehensiveCTAValue;
};

const communityImageUrl =
  "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg";

const resolveSurfaceForegroundColor = (
  surfaceColor?: ThemeColor,
): string | undefined =>
  resolveThemeColorCssValue(getDefaultForegroundColor(surfaceColor));

const defaultSectionImage: SharedImageFieldValue = {
  image: {
    field: "",
    constantValue: {
      url: communityImageUrl,
      width: 1267,
      height: 1900,
      alternateText: "Community editorial image",
    },
    constantValueEnabled: true,
  },
  aspectRatio: 0,
  imageConstrain: "filled",
  styles: {
    borderRadius: "default",
  },
};

const defaultHeading: SharedTextFieldValue = {
  text: {
    field: "",
    constantValue: {
      defaultValue: "Community & Events",
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  styles: {
    fontFamily: "default",
    fontSize: "clamp(28px, 3vw, 46px)",
    fontWeight: "700",
    fontStyle: "default",
    textTransform: "uppercase",
  },
  fontColor: undefined,
};

const defaultBody: SharedRichTextFieldValue = {
  text: {
    field: "",
    constantValue: {
      defaultValue: getDefaultRTF(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse potenti. Curabitur feugiat lacus in lectus dictum, eu malesuada arcu pulvinar.",
      ),
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  styles: {
    fontFamily: "default",
    fontSize: "20px",
    fontWeight: "400",
    fontStyle: "default",
    textTransform: "default",
  },
  fontColor: undefined,
};

const defaultCta: ComprehensiveCTAValue = {
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label: {
          defaultValue: "Join Mailing List",
          hasLocalizedValue: "true",
        },
        link: {
          defaultValue: "#",
          hasLocalizedValue: "true",
        },
        normalizeLink: false,
        openInNewTab: false,
      },
      constantValueEnabled: true,
      selectedType: "textAndLink",
    },
    openInNewTab: false,
  },
  styles: {
    variant: "primary",
    button: {
      fontFamily: "default",
      fontSize: "13px",
      fontWeight: "400",
      fontStyle: "default",
      textTransform: "uppercase",
      borderRadius: "default",
      letterSpacing: "0.08em",
    },
  },
};

const defaultSectionBackgroundColor: ThemeColor = {
  selectedColor: "[#000000]",
  contrastingColor: "white",
  isDarkColor: true,
};

const communityFields: YextFields<ModernRetailCommunityProps> = {
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
  sectionImage: {
    label: "Section Image",
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: "Image",
        filter: {
          types: ["type.image"],
        },
      },
      aspectRatio: {
        label: "Aspect Ratio",
        type: "basicSelector",
        options: ThemeOptions.ASPECT_RATIO,
      },
      imageConstrain: {
        label: "Image Constrain",
        type: "select",
        options: [
          { label: "Fixed", value: "fixed" },
          { label: "Filled", value: "filled" },
        ],
      },
      styles: {
        label: "Image Styles",
        type: "styledImage",
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
  body: {
    label: "Body",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.rich_text_v2"],
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
  cta: {
    label: "Call to Action",
    type: "comprehensiveCTA",
  },
};

const ModernRetailCommunityComponent: PuckComponent<
  ModernRetailCommunityProps
> = (props) => {
  const streamDocument =
    (useDocument() as StreamDocumentShape | undefined) ?? {};
  const locale = streamDocument.locale ?? "en";
  const resolvedSectionImage =
    resolveComponentData(props.sectionImage.image, locale, streamDocument);
  const hasSectionImage = Boolean(
    resolvedSectionImage &&
      typeof resolvedSectionImage === "object" &&
      "url" in resolvedSectionImage &&
      resolvedSectionImage.url,
  );
  const resolvedHeadingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const sectionForeground =
    resolveSurfaceForegroundColor(props.section.backgroundColor);
  const overlayForegroundColor: ThemeColor = {
    selectedColor: "white",
    contrastingColor: "black",
  };
  const overlayForeground = resolveThemeColorCssValue(overlayForegroundColor);
  const ctaUsesSurfaceDefaultColor =
    props.cta.styles?.variant !== "primary" &&
    !props.cta.styles?.color;
  const resolvedBody = resolveComponentData(
    props.body.text,
    locale,
    streamDocument,
    {
      richTextStyleOverrides: {
        ...props.body.styles,
        color:
          resolveThemeColorCssValue(props.body.fontColor) ??
          overlayForeground,
      },
    },
  );
  const bodyContent = React.isValidElement(resolvedBody) ? (
    resolvedBody
  ) : (
    <MaybeRTF
      data={resolvedBody as string | RichText | undefined}
      richTextStyleOverrides={{
        ...props.body.styles,
        color:
          resolveThemeColorCssValue(props.body.fontColor) ??
          overlayForeground,
      }}
    />
  );
  const ctaValue: Partial<ComprehensiveCTAValue> = {
    data: props.cta.data,
    styles: {
      ...props.cta.styles,
      color: ctaUsesSurfaceDefaultColor
        ? overlayForegroundColor
        : props.cta.styles?.color,
    },
    className: props.cta.className,
    eventName: props.cta.eventName,
  };
  const imageWrapperStyle: React.CSSProperties = {
    aspectRatio:
      props.sectionImage.aspectRatio > 0 ? props.sectionImage.aspectRatio : undefined,
    borderRadius:
      props.sectionImage.styles?.borderRadius === "default"
        ? undefined
        : props.sectionImage.styles?.borderRadius,
    height: "100%",
    overflow:
      props.sectionImage.imageConstrain === "filled" ||
      Boolean(
        props.sectionImage.styles?.borderRadius &&
          props.sectionImage.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
  };
  const imageStyle: React.CSSProperties = {
    display: "block",
    height: "100%",
    objectFit:
      props.sectionImage.imageConstrain === "filled" ? "cover" : "contain",
    width: "100%",
  };

  return (
    <AnalyticsScopeProvider
      name={`ModernRetailCommunity${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{`
          .image-banner {
            min-height: inherit;
            position: relative;
          }
          .image-banner__media {
            inset: 0;
            position: absolute;
          }
          .image-banner__overlay {
            background: rgba(0, 0, 0, 0.48);
            inset: 0;
            position: absolute;
            z-index: 0;
          }
          .image-banner__content {
            height: 100%;
            inset: 0;
            position: relative;
            width: 100%;
            z-index: 1;
          }
          .image-banner__content-container {
            align-items: flex-end;
            display: flex;
            height: 100%;
            margin: 0 auto;
            max-width: 1200px;
            min-height: inherit;
            padding: 32px 16px;
          }
          .image-banner__content-wrapper {
            max-width: 560px;
          }
          .ps-community-body {
            line-height: 1.5;
          }
          .ps-community-body,
          .ps-community-body p {
            margin: 0;
          }
          .ps-community-body p + p {
            margin-top: 1em;
          }
          .block-banner-container .block-heading {
            letter-spacing: -0.04em;
            line-height: 1.15;
          }
          @media (max-width: 1024px) {
            .block-banner-container .block-heading {
              font-size: clamp(24px, 6vw, 38px);
            }
            .ps-community-body {
              font-size: 16px;
            }
          }
          @media (max-width: 749px) {
            .ps-community-shell {
              min-height: 300px !important;
            }
            .block-banner-container .block-heading {
              font-size: clamp(22px, 8vw, 34px);
            }
            .image-banner__content-container {
              align-items: flex-end;
              padding-bottom: 24px;
            }
          }
        `}</style>
        <section
          id="theme-section-template--25351194706234__section_image_banner_blocks_wqPDfX"
          className="theme-section ps-community-shell"
          style={{
            backgroundColor: resolveThemeColorCssValue(props.section.backgroundColor),
            color: sectionForeground,
            minHeight: "420px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div className="image-banner image-banner--height-medium color-scheme-7">
            {hasSectionImage && resolvedSectionImage ? (
              <div className="image-banner__media">
                <EntityField
                  displayName="Section Image"
                  fieldId={props.sectionImage.image.field}
                  constantValueEnabled={props.sectionImage.image.constantValueEnabled}
                >
                  <div style={imageWrapperStyle}>
                    <Image image={resolvedSectionImage} style={imageStyle} />
                  </div>
                </EntityField>
              </div>
            ) : null}
            <div className="image-banner__overlay" aria-hidden="true" />
            <div className="image-banner__content content--bottom-left content-mobile--bottom image-banner__content--left">
              <div className="image-banner__content-container">
                <div className="image-banner__content-wrapper banner__box--transparent color-scheme-7">
                  <div
                    className="block-banner-container"
                    style={{ color: overlayForeground }}
                  >
                    <EntityField
                      displayName="Heading"
                      fieldId={props.heading.text.field}
                      constantValueEnabled={props.heading.text.constantValueEnabled}
                    >
                      <h2
                        className="block-heading inline-richtext h1 heading-color heading-font"
                        style={{
                          color:
                            resolveThemeColorCssValue(props.heading.fontColor) ??
                            overlayForeground,
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
                    <EntityField
                      displayName="Body"
                      fieldId={props.body.text.field}
                      constantValueEnabled={props.body.text.constantValueEnabled}
                    >
                      <div
                        className="block-text inline-richtext rte ps-community-body"
                        style={{
                          margin: "14px 0 18px",
                          opacity: props.body.fontColor ? undefined : 0.82,
                        }}
                      >
                        {bodyContent}
                      </div>
                    </EntityField>
                    <EntityField
                      displayName="Community Call to Action"
                      fieldId={props.cta.data.cta.field}
                      constantValueEnabled={
                        props.cta.data.cta.constantValueEnabled
                      }
                    >
                      <ComprehensiveCTA
                        value={ctaValue}
                        eventName="communityCta"
                        onClick={
                          props.puck.isEditing
                            ? (event) => {
                                event.preventDefault();
                              }
                            : undefined
                        }
                        style={{
                          alignItems: "center",
                          display: "inline-flex",
                          justifyContent: "center",
                          minHeight: "44px",
                          padding: "10px 24px",
                          textDecoration: "none",
                        }}
                      />
                    </EntityField>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const ModernRetailCommunity: YextComponentConfig<ModernRetailCommunityProps> =
  {
    label: "Events",
    fields: communityFields,
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: defaultSectionBackgroundColor,
      },
      sectionImage: defaultSectionImage,
      heading: defaultHeading,
      body: defaultBody,
      cta: defaultCta,
    },
    render: (props) => <ModernRetailCommunityComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "ModernRetailCommunity",
  displayName: "Events",
  description: "Events",
  pageSetTypes: ["ENTITY"],
};
