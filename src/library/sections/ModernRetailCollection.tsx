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

type ModernRetailCollectionProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  cardBackgroundColor: ThemeColor;
  heading: SharedTextFieldValue;
  body: SharedRichTextFieldValue;
  sectionImage: SharedImageFieldValue;
  cta: ComprehensiveCTAValue;
};

const collectionImageUrl =
  "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg";

const resolveSurfaceForegroundColor = (
  surfaceColor?: ThemeColor,
): string | undefined =>
  resolveThemeColorCssValue(getDefaultForegroundColor(surfaceColor));

const getTextStyles = (
  styles: StyledTextValue,
  color?: ThemeColor,
): React.CSSProperties => ({
  color: resolveThemeColorCssValue(color),
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

const defaultHeading: SharedTextFieldValue = {
  text: {
    field: "",
    constantValue: {
      defaultValue: "Shop Our Seasonal Collection",
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  styles: {
    fontFamily: "default",
    fontSize: "clamp(28px, 3.4vw, 44px)",
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
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sodales nibh ut nisl facilisis, vitae ultrices sapien malesuada.",
      ),
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  styles: {
    fontFamily: "default",
    fontSize: "16px",
    fontWeight: "default",
    fontStyle: "default",
    textTransform: "default",
  },
  fontColor: undefined,
};

const defaultSectionImage: SharedImageFieldValue = {
  image: {
    field: "",
    constantValue: {
      url: collectionImageUrl,
      width: 1267,
      height: 1900,
      alternateText: "Seasonal collection editorial image",
    },
    constantValueEnabled: true,
  },
  aspectRatio: 0,
  imageConstrain: "filled",
  styles: {
    borderRadius: "default",
  },
};

const defaultCta: ComprehensiveCTAValue = {
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label: {
          defaultValue: "Shop Now",
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
    color: {
      selectedColor: "palette-primary",
      contrastingColor: "palette-primary-contrast",
    },
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

const collectionFields: YextFields<ModernRetailCollectionProps> = {
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
  cardBackgroundColor: {
    label: "Card Background Color",
    type: "basicSelector",
    options: "BACKGROUND_COLOR",
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
  cta: {
    label: "Call to Action",
    type: "comprehensiveCTA",
  },
};

const ModernRetailCollectionComponent: PuckComponent<
  ModernRetailCollectionProps
> = (props) => {
  const streamDocument =
    (useDocument() as StreamDocumentShape | undefined) ?? {};
  const locale = streamDocument.locale ?? "en";
  const resolvedHeadingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedSectionImage =
    resolveComponentData(props.sectionImage.image, locale, streamDocument);
  const hasSectionImage = Boolean(
    resolvedSectionImage &&
      typeof resolvedSectionImage === "object" &&
      "url" in resolvedSectionImage &&
      resolvedSectionImage.url,
  );
  const cardForeground =
    resolveSurfaceForegroundColor(props.cardBackgroundColor) ??
    resolveSurfaceForegroundColor(props.section.backgroundColor);
  const resolvedBody = resolveComponentData(
    props.body.text,
    locale,
    streamDocument,
    {
      richTextStyleOverrides: {
        ...props.body.styles,
        color: resolveThemeColorCssValue(props.body.fontColor),
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
        color: resolveThemeColorCssValue(props.body.fontColor),
      }}
    />
  );
  const ctaValue: Partial<ComprehensiveCTAValue> = {
    data: props.cta.data,
    styles: props.cta.styles,
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
      name={`ModernRetailCollection${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{`
        .ps-collection-divider {
          margin: 0 auto;
          max-width: 1200px;
          padding: 0 16px;
        }
        .ps-collection-layout {
          margin: 0 auto;
          max-width: 1200px;
          padding: 48px 16px;
        }
        .before-and-after__wrapper {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(17, 17, 17, 0.06);
        }
        .before-and-after__content {
          display: flex;
          align-items: center;
          padding: clamp(24px, 4vw, 48px);
        }
        .before-and-after__content-blocks {
          display: grid;
          width: 100%;
        }
        .ps-collection-shell .block-heading {
          letter-spacing: -0.04em;
          line-height: 1.08;
        }
        .ps-collection-shell .block-text,
        .ps-collection-shell .block-text p {
          margin: 0;
        }
        .ps-collection-shell .block-text p + p {
          margin-top: 1em;
        }
        .before-and-after__comparison {
          background: transparent;
          min-height: 100%;
        }
        .before-and-after__slider-component,
        .before-and-after__slider-wrapper {
          height: 100%;
          min-height: 360px;
          position: relative;
        }
        .before-and-after__image-wrapper {
          inset: 0;
          position: absolute;
        }
        .ps-collection-shell a { text-decoration: none; }
        .ps-collection-shell .ps-collection-cta:hover,
        .ps-collection-shell .ps-collection-cta:focus-visible {
          opacity: 0.88;
        }
        @media (max-width: 749px) {
          .before-and-after__wrapper {
            grid-template-columns: 1fr !important;
          }
          .before-and-after__comparison {
            min-height: 300px;
          }
          .ps-collection-grid {
            grid-template-columns: 1fr !important;
          }
          .ps-collection-copy {
            order: 1;
          }
          .ps-collection-media {
            order: 2;
          }
        }
      `}</style>
        <>
          <div
            id="theme-section-template--25351194706234__section_divider_3"
            className="theme-section section-divider"
            style={{
              backgroundColor: resolveThemeColorCssValue(props.section.backgroundColor),
              color: resolveSurfaceForegroundColor(props.section.backgroundColor),
            }}
          >
            <div className="ps-collection-divider color-scheme-1">
              <div
                className="divider-line"
                style={{ borderBottom: "1px solid currentColor" }}
              />
            </div>
          </div>
          <section
            id="theme-section-template--25351194706234__section_before_and_after_1"
            className="theme-section ps-collection-shell"
            style={{
              backgroundColor: resolveThemeColorCssValue(props.section.backgroundColor),
              color: resolveSurfaceForegroundColor(props.section.backgroundColor),
            }}
          >
            <div className="ps-collection-layout color-scheme-1">
              <div className="before-and-after">
                <div
                  className="before-and-after__wrapper"
                  style={{
                    backgroundColor: resolveThemeColorCssValue(props.cardBackgroundColor),
                    color: cardForeground,
                    gridTemplateColumns: hasSectionImage ? undefined : "1fr",
                  }}
                >
                  <div className="before-and-after__content">
                    <div className="before-and-after__content-blocks">
                      <EntityField
                        displayName="Heading"
                        fieldId={props.heading.text.field}
                        constantValueEnabled={props.heading.text.constantValueEnabled}
                      >
                        <h2
                          className="block-heading inline-richtext h2 heading-color heading-font"
                          style={{
                            ...getTextStyles(props.heading.styles, props.heading.fontColor),
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
                      <div
                        className="spacer-block"
                        style={{ minHeight: "1.6rem" }}
                      />
                      <EntityField
                        displayName="Body"
                        fieldId={props.body.text.field}
                        constantValueEnabled={props.body.text.constantValueEnabled}
                      >
                        <div
                          className="block-text inline-richtext rte"
                          style={{
                            lineHeight: 1.5,
                            opacity: props.body.fontColor ? undefined : 0.78,
                          }}
                        >
                          {bodyContent}
                        </div>
                      </EntityField>
                      <div
                        className="spacer-block"
                        style={{ minHeight: "2.4rem" }}
                      />
                      <EntityField
                        displayName="Collection Call to Action"
                        fieldId={props.cta.data.cta.field}
                        constantValueEnabled={
                          props.cta.data.cta.constantValueEnabled
                        }
                      >
                        <ComprehensiveCTA
                          value={ctaValue}
                          className="button button--primary ps-collection-cta"
                          eventName="collectionCta"
                          onClick={
                            props.puck.isEditing
                              ? (event) => {
                                  event.preventDefault();
                                }
                              : undefined
                          }
                          style={{
                            alignSelf: "flex-start",
                            alignItems: "center",
                            display: "inline-flex",
                            flex: "0 0 auto",
                            justifyContent: "center",
                            minHeight: "44px",
                            padding: "10px 24px",
                            whiteSpace: "nowrap",
                            width: "fit-content",
                          }}
                        />
                      </EntityField>
                    </div>
                  </div>
                  {hasSectionImage && resolvedSectionImage ? (
                    <div className="before-and-after__comparison color-scheme-1">
                      <div className="before-and-after__slider-component">
                        <div className="before-and-after__slider-wrapper">
                          <div className="before-and-after__image-wrapper">
                            <EntityField
                              displayName="Section Image"
                              fieldId={props.sectionImage.image.field}
                              constantValueEnabled={
                                props.sectionImage.image.constantValueEnabled
                              }
                            >
                              <div style={imageWrapperStyle}>
                                <Image
                                  image={resolvedSectionImage}
                                  style={imageStyle}
                                />
                              </div>
                            </EntityField>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const ModernRetailCollection: YextComponentConfig<ModernRetailCollectionProps> =
  {
    label: "Promotion",
    fields: collectionFields,
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
      body: defaultBody,
      sectionImage: defaultSectionImage,
      cta: defaultCta,
    },
    render: (props) => <ModernRetailCollectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "ModernRetailCollection",
  displayName: "Promotion",
  description: "Promotion",
  pageSetTypes: ["ENTITY"],
};
