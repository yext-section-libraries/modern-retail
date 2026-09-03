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

type ModernRetailAboutProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  cardBackgroundColor: ThemeColor;
  sectionImage: SharedImageFieldValue;
  heading: SharedTextFieldValue;
  body: SharedRichTextFieldValue;
  cta: ComprehensiveCTAValue;
};

const aboutImageUrl =
  "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg";

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

const defaultSectionImage: SharedImageFieldValue = {
  image: {
    field: "",
    constantValue: {
      url: aboutImageUrl,
      width: 1267,
      height: 1900,
      alternateText: "About section editorial image",
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
      defaultValue: "About This Store",
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
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam erat volutpat, pulvinar nec lectus sed, consequat tempus elit.\n\nVestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; nunc dictum tincidunt nibh, eu hendrerit mi efficitur vitae.",
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

const defaultCta: ComprehensiveCTAValue = {
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label: {
          defaultValue: "Learn More",
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

const aboutFields: YextFields<ModernRetailAboutProps> = {
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

const ModernRetailAboutComponent: PuckComponent<ModernRetailAboutProps> = (
  props,
) => {
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
      name={`ModernRetailAbout${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{`
          .ps-about-shell {
            background: transparent;
          }
          .ps-about-layout {
            margin: 0 auto;
            max-width: 1200px;
            padding: 48px 16px;
          }
          .about-store-feature {
            display: grid;
            grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
            overflow: hidden;
            box-shadow: 0 16px 40px rgba(17, 17, 17, 0.06);
          }
          .about-store-feature__media {
            min-height: 100%;
          }
          .about-store-feature__content {
            align-content: center;
            display: grid;
            gap: 24px;
            padding: clamp(24px, 4vw, 48px);
          }
          .about-store-feature__title {
            letter-spacing: -0.04em;
            line-height: 1.08;
          }
          .about-store-feature__body,
          .about-store-feature__body p {
            margin: 0;
          }
          .about-store-feature__body p + p {
            margin-top: 1em;
          }
          .ps-about-shell a {
            text-decoration: none;
          }
          .ps-about-shell .ps-about-cta:hover,
          .ps-about-shell .ps-about-cta:focus-visible {
            opacity: 0.88;
          }
          @media (max-width: 1024px) {
            .ps-about-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
        <section
          id="theme-section-template--25351194706234__section_about_store"
          className="theme-section ps-about-shell"
          style={{
            backgroundColor: resolveThemeColorCssValue(props.section.backgroundColor),
            color: resolveSurfaceForegroundColor(props.section.backgroundColor),
          }}
        >
          <div className="ps-about-layout color-scheme-1">
            <div
              className="about-store-feature ps-about-grid"
              style={{
                backgroundColor: resolveThemeColorCssValue(props.cardBackgroundColor),
                color: cardForeground,
                gridTemplateColumns: hasSectionImage ? undefined : "1fr",
              }}
            >
              {hasSectionImage && resolvedSectionImage ? (
                <div className="about-store-feature__media">
                  <EntityField
                    displayName="Section Image"
                    fieldId={props.sectionImage.image.field}
                    constantValueEnabled={
                      props.sectionImage.image.constantValueEnabled
                    }
                  >
                    <div style={imageWrapperStyle}>
                      <Image image={resolvedSectionImage} style={imageStyle} />
                    </div>
                  </EntityField>
                </div>
              ) : null}
              <div className="about-store-feature__content background-secondary">
                <EntityField
                  displayName="Heading"
                  fieldId={props.heading.text.field}
                  constantValueEnabled={props.heading.text.constantValueEnabled}
                >
                  <h2
                    className="about-store-feature__title heading-font heading-color"
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
                <EntityField
                  displayName="Body"
                  fieldId={props.body.text.field}
                  constantValueEnabled={props.body.text.constantValueEnabled}
                >
                  <div
                    className="about-store-feature__body"
                    style={{
                      lineHeight: 1.5,
                      opacity: props.body.fontColor ? undefined : 0.78,
                    }}
                  >
                    {bodyContent}
                  </div>
                </EntityField>
                <EntityField
                  displayName="About Call to Action"
                  fieldId={props.cta.data.cta.field}
                  constantValueEnabled={
                    props.cta.data.cta.constantValueEnabled
                  }
                >
                  <ComprehensiveCTA
                    value={ctaValue}
                    className="ps-about-cta"
                    eventName="aboutCta"
                    onClick={
                      props.puck.isEditing
                        ? (event) => {
                            event.preventDefault();
                          }
                        : undefined
                    }
                    style={{
                      alignSelf: "flex-start",
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
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const ModernRetailAbout: YextComponentConfig<ModernRetailAboutProps> =
  {
    label: "About",
    fields: aboutFields,
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
      sectionImage: defaultSectionImage,
      heading: defaultHeading,
      body: defaultBody,
      cta: defaultCta,
    },
    render: (props) => <ModernRetailAboutComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "ModernRetailAbout",
  displayName: "About",
  description: "About",
  pageSetTypes: ["ENTITY"],
};
