import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  ComprehensiveCTA,
  createItemSource,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
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

type SharedImageStyles = {
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type ServicesCard = {
  image: YextEntityField<TranslatableAssetImage>;
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
};

type ModernRetailServicesProps = {
  section: {
    backgroundColor: ThemeColor;
    cardBackgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  data: {
    heading: YextEntityField<TranslatableString>;
    sectionButton: ComprehensiveCTAValue;
    cards: typeof servicesCardsSource.value;
  };
  styles: {
    heading: {
      styles: StyledTextValue;
      fontColor?: ThemeColor;
    };
    cardTitle: {
      styles: StyledTextValue;
      fontColor?: ThemeColor;
    };
    cardDescription: {
      styles: StyledTextValue;
      fontColor?: ThemeColor;
    };
    cardImage: SharedImageStyles;
    cardButton: ComprehensiveCTAValue;
  };
};

const resolveSurfaceForegroundColor = (
  surfaceColor?: ThemeColor,
): string | undefined =>
  resolveThemeColorCssValue(getDefaultForegroundColor(surfaceColor));

const getSurfaceContrastColor = (
  surfaceColor?: ThemeColor,
): ThemeColor | undefined =>
  surfaceColor?.contrastingColor
    ? {
        selectedColor: surfaceColor.contrastingColor,
        contrastingColor: surfaceColor.selectedColor,
      }
    : undefined;

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

const defaultHeading: ModernRetailServicesProps["data"]["heading"] = {
  field: "",
  constantValue: {
    defaultValue: "Featured Shopping Experiences",
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
};

const defaultHeadingStyles: ModernRetailServicesProps["styles"]["heading"] = {
  styles: {
    fontFamily: "default",
    fontSize: "44px",
    fontWeight: "700",
    fontStyle: "default",
    textTransform: "uppercase",
  },
};

const defaultSectionButton: ComprehensiveCTAValue = {
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label: {
          defaultValue: "See All Services",
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

const defaultCardButton: ComprehensiveCTAValue = {
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
    variant: "secondary",
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

const defaultCardTitle: ModernRetailServicesProps["styles"]["cardTitle"] = {
  styles: {
    fontFamily: "default",
    fontSize: "20px",
    fontWeight: "700",
    fontStyle: "default",
    textTransform: "default",
  },
};

const defaultCardDescription: ModernRetailServicesProps["styles"]["cardDescription"] =
  {
    styles: {
      fontFamily: "default",
      fontSize: "16px",
      fontWeight: "400",
      fontStyle: "default",
      textTransform: "default",
    },
  };

const defaultServicesCard: ServicesCard = {
  image: {
    field: "",
    constantValue: {
      url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
      width: 1267,
      height: 1900,
      alternateText: "Editorial service card",
    },
    constantValueEnabled: true,
  },
  title: {
    field: "",
    constantValue: {
      defaultValue: "Lorem ipsum",
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  description: {
    field: "",
    constantValue: {
      defaultValue: getDefaultRTF("Lorem ipsum dolor sit amet."),
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
};

const defaultServicesCards: ServicesCard[] = [
  {
    ...defaultServicesCard,
    title: {
      field: "",
      constantValue: {
        defaultValue: "Lorem Styling",
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    description: {
      field: "",
      constantValue: {
        defaultValue: getDefaultRTF(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
        ),
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    image: {
      field: "",
      constantValue: {
        url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
        width: 1267,
        height: 1900,
        alternateText: "Editorial service card one",
      },
      constantValueEnabled: true,
    },
  },
  {
    ...defaultServicesCard,
    title: {
      field: "",
      constantValue: {
        defaultValue: "Ipsum Atelier",
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    description: {
      field: "",
      constantValue: {
        defaultValue: getDefaultRTF(
          "Curabitur pharetra orci sit amet urna feugiat, at faucibus nibh placerat.",
        ),
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    image: {
      field: "",
      constantValue: {
        url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
        width: 1267,
        height: 1900,
        alternateText: "Editorial service card two",
      },
      constantValueEnabled: true,
    },
  },
  {
    ...defaultServicesCard,
    title: {
      field: "",
      constantValue: {
        defaultValue: "Dolor Pairing",
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    description: {
      field: "",
      constantValue: {
        defaultValue: getDefaultRTF(
          "Sed posuere sapien vitae massa convallis, non feugiat lectus blandit.",
        ),
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    image: {
      field: "",
      constantValue: {
        url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
        width: 1267,
        height: 1900,
        alternateText: "Editorial service card three",
      },
      constantValueEnabled: true,
    },
  },
  {
    ...defaultServicesCard,
    title: {
      field: "",
      constantValue: {
        defaultValue: "Amet Tailoring",
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    description: {
      field: "",
      constantValue: {
        defaultValue: getDefaultRTF(
          "Vivamus luctus tortor vel lacus maximus, ut malesuada velit vulputate.",
        ),
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    image: {
      field: "",
      constantValue: {
        url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
        width: 1267,
        height: 1900,
        alternateText: "Editorial service card four",
      },
      constantValueEnabled: true,
    },
  },
];

const servicesCardsSource = createItemSource<ServicesCard>({
  label: "Cards",
  mappingFields: {
    image: {
      type: "entityField",
      label: "Image",
      filter: {
        types: ["type.image"],
      },
    },
    title: {
      label: "Title",
      type: "entityField",
      filter: {
        types: ["type.string"],
      },
    },
    description: {
      label: "Description",
      type: "entityField",
      filter: {
        types: ["type.rich_text_v2"],
      },
    },
  },
  defaultValues: defaultServicesCards,
});

const servicesFields: YextFields<ModernRetailServicesProps> = {
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
      cardBackgroundColor: {
        label: "Card Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  data: {
    label: "Data",
    type: "object",
    objectFields: {
      heading: {
        label: "Heading",
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      },
      sectionButton: {
        label: "Section Button",
        type: "comprehensiveCTA",
      },
      cards: servicesCardsSource.field,
    },
  },
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      heading: {
        label: "Heading",
        type: "object",
        objectFields: {
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
      cardTitle: {
        label: "Card Title",
        type: "object",
        objectFields: {
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
      cardDescription: {
        label: "Card Description",
        type: "object",
        objectFields: {
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
      cardImage: {
        label: "Card Image",
        type: "object",
        objectFields: {
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
      cardButton: {
        label: "Card Button",
        type: "comprehensiveCTA",
      },
    },
  },
};

const ModernRetailServicesComponent: PuckComponent<
  ModernRetailServicesProps
> = (props) => {
  const streamDocument =
    (useDocument() as StreamDocumentShape | undefined) ?? {};
  const locale = streamDocument.locale ?? "en";
  const resolvedHeadingText =
    resolveComponentData(props.data.heading, locale, streamDocument) || "";
  const sectionForeground = resolveSurfaceForegroundColor(
    props.section.backgroundColor,
  );
  const sectionBackgroundColor = resolveThemeColorCssValue(
    props.section.backgroundColor,
  );
  const cardBackgroundColor = resolveThemeColorCssValue(
    props.section.cardBackgroundColor,
  );
  const cardForeground = resolveSurfaceForegroundColor(
    props.section.cardBackgroundColor,
  );
  const cardCtaColor = getSurfaceContrastColor(
    props.section.cardBackgroundColor,
  );
  const resolvedSectionButton: Partial<ComprehensiveCTAValue> = {
    data: props.data.sectionButton.data,
    styles: props.data.sectionButton.styles,
    className: props.data.sectionButton.className,
    eventName: props.data.sectionButton.eventName,
  };
  const resolvedCardButton: Partial<ComprehensiveCTAValue> = {
    data: props.styles.cardButton.data,
    styles: {
      ...props.styles.cardButton.styles,
      color: !props.styles.cardButton.styles?.color
        ? props.styles.cardButton.styles?.variant === "primary"
          ? undefined
          : cardCtaColor
        : props.styles.cardButton.styles.color,
    },
    className: props.styles.cardButton.className,
    eventName: props.styles.cardButton.eventName,
  };

  const resolvedCards = servicesCardsSource
    .resolveItems(props.data.cards, streamDocument)
    .map((card, index) => {
      const resolvedImage = card.image
        ? resolveComponentData(card.image, locale, streamDocument)
        : undefined;
      const resolvedTitle = card.title
        ? resolveComponentData(card.title, locale, streamDocument)
        : "";
      const resolvedDescription = card.description
        ? resolveComponentData(card.description, locale, streamDocument)
        : undefined;
      const descriptionContent = React.isValidElement(resolvedDescription) ? (
        resolvedDescription
      ) : (
        <MaybeRTF data={resolvedDescription as string | RichText | undefined} />
      );

      return {
        key: `${String(resolvedTitle) || "featured-item"}-${index}`,
        image: resolvedImage,
        hasImage: Boolean(
          resolvedImage &&
          typeof resolvedImage === "object" &&
          "url" in resolvedImage &&
          resolvedImage.url,
        ),
        title: resolvedTitle,
        descriptionContent,
      };
    });
  const hasCardImages = resolvedCards.some((card) => card.hasImage);

  return (
    <AnalyticsScopeProvider
      name={`ModernRetailServices${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{`
          .ps-services-layout {
            margin: 0 auto;
            max-width: 1200px;
            padding: 48px 16px;
          }
          .store-services-showcase__title {
            font-family: "Roboto", sans-serif;
            font-size: clamp(28px, 3.4vw, 44px);
            font-style: normal;
            font-weight: 700;
            letter-spacing: -0.04em;
            line-height: 1.08;
            text-transform: uppercase;
          }
          .store-services-showcase__card-title {
            font-family: "Roboto", sans-serif;
            font-size: 20px;
            font-style: normal;
            font-weight: 700;
            line-height: 1.12;
          }
          .store-services-showcase__card-text,
          .store-services-showcase__card-text p {
            font-size: 16px;
            font-weight: 400;
            line-height: 1.5;
            margin: 0;
            max-width: 32rem;
          }
          .store-services-showcase__card-text p + p {
            margin-top: 1em;
          }
          .ps-services-shell a { text-decoration: none; }
          .ps-services-card {
            display: flex;
            flex-direction: column;
            min-height: 100%;
            overflow: hidden;
            transition: transform 180ms ease;
          }
          .ps-services-card:hover,
          .ps-services-card:focus-within {
            transform: translateY(-3px);
          }
          .ps-services-card-cta:hover,
          .ps-services-card-cta:focus-visible,
          .ps-services-top-cta:hover,
          .ps-services-top-cta:focus-visible {
            opacity: 0.88;
          }
          @media (max-width: 1024px) {
            .ps-services-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }
          @media (max-width: 749px) {
            .ps-services-head {
              align-items: flex-start !important;
              display: grid !important;
            }
            .ps-services-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
        <section
          id="theme-section-template--25351194706234__section_store_services"
          className="theme-section ps-services-shell"
          style={{
            backgroundColor: sectionBackgroundColor,
            color: sectionForeground,
          }}
        >
          <div
            className="ps-services-layout color-scheme-1"
            style={
              {
                borderTop: "1px solid currentColor",
              } as React.CSSProperties
            }
          >
            <div className="store-services-showcase">
              <div
                className="store-services-showcase__intro ps-services-head"
                style={{
                  alignItems: "center",
                  display: "flex",
                  gap: "24px",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <EntityField
                  displayName="Heading"
                  fieldId={props.data.heading.field}
                  constantValueEnabled={props.data.heading.constantValueEnabled}
                >
                  <h2
                    className="store-services-showcase__title heading-font heading-color text-uppercase"
                    style={{
                      ...getTextStyles(
                        props.styles.heading.styles,
                        props.styles.heading.fontColor,
                      ),
                      margin: 0,
                    }}
                  >
                    {resolvedHeadingText}
                  </h2>
                </EntityField>
                <EntityField
                  displayName="Section Call to Action"
                  fieldId={props.data.sectionButton.data.cta.field}
                  constantValueEnabled={
                    props.data.sectionButton.data.cta.constantValueEnabled
                  }
                >
                  <ComprehensiveCTA
                    value={resolvedSectionButton}
                    className="button button--primary store-services-showcase__intro-cta ps-services-top-cta"
                    eventName="servicesIndexCta"
                    onClick={
                      props.puck.isEditing
                        ? (event) => {
                            event.preventDefault();
                          }
                        : undefined
                    }
                  />
                </EntityField>
              </div>
              <EntityField
                displayName="Cards"
                fieldId={props.data.cards.field}
                constantValueEnabled={props.data.cards.constantValueEnabled}
              >
                <div
                  className="store-services-showcase__grid ps-services-grid"
                  style={{
                    display: "grid",
                    gap: "16px",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  }}
                >
                  {resolvedCards.map((card, index) => (
                    <article
                      key={card.key}
                      className="store-services-showcase__card ps-services-card border border-current/10"
                    >
                      {hasCardImages ? (
                        <div
                          className="store-services-showcase__media"
                          style={{
                            aspectRatio:
                              props.styles.cardImage.aspectRatio > 0
                                ? props.styles.cardImage.aspectRatio
                                : undefined,
                            backgroundColor: cardBackgroundColor,
                            overflow: "hidden",
                          }}
                        >
                          {card.hasImage && card.image ? (
                            <Image
                              image={card.image}
                              style={{
                                display: "block",
                                height: "100%",
                                objectFit:
                                  props.styles.cardImage.imageConstrain ===
                                  "filled"
                                    ? "cover"
                                    : "contain",
                                width: "100%",
                              }}
                            />
                          ) : null}
                        </div>
                      ) : null}
                      <div
                        className="store-services-showcase__content color-scheme-5"
                        style={{
                          backgroundColor: cardBackgroundColor,
                          color: cardForeground,
                          display: "grid",
                          gap: "16px",
                          padding: "24px",
                          flex: 1,
                        }}
                      >
                        <div
                          className="store-services-showcase__content-copy"
                          style={{ display: "grid", gap: "8px" }}
                        >
                          <h3
                            className="store-services-showcase__card-title"
                            style={{
                              ...getTextStyles(
                                props.styles.cardTitle.styles,
                                props.styles.cardTitle.fontColor,
                              ),
                              margin: 0,
                            }}
                          >
                            {card.title}
                          </h3>
                          <div
                            className="store-services-showcase__card-text"
                            style={{
                              ...getTextStyles(
                                props.styles.cardDescription.styles,
                                props.styles.cardDescription.fontColor,
                              ),
                            }}
                          >
                            {card.descriptionContent}
                          </div>
                        </div>
                        <EntityField
                          displayName="Card Call to Action"
                          fieldId={props.styles.cardButton.data.cta.field}
                          constantValueEnabled={
                            props.styles.cardButton.data.cta
                              .constantValueEnabled
                          }
                        >
                          <ComprehensiveCTA
                            value={resolvedCardButton}
                            className="store-services-showcase__cta ps-services-card-cta"
                            eventName={`servicecta${index}`}
                            onClick={
                              props.puck.isEditing
                                ? (event) => {
                                    event.preventDefault();
                                  }
                                : undefined
                            }
                          />
                        </EntityField>
                      </div>
                    </article>
                  ))}
                </div>
              </EntityField>
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const ModernRetailServices: YextComponentConfig<ModernRetailServicesProps> =
  {
    label: "Services",
    fields: servicesFields,
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "palette-quaternary",
        },
        cardBackgroundColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
      },
      data: {
        heading: defaultHeading,
        sectionButton: defaultSectionButton,
        cards: servicesCardsSource.defaultValue,
      },
      styles: {
        heading: defaultHeadingStyles,
        cardTitle: defaultCardTitle,
        cardDescription: defaultCardDescription,
        cardImage: {
          aspectRatio: 1,
          imageConstrain: "filled",
          styles: {
            borderRadius: "default",
          },
        },
        cardButton: defaultCardButton,
      },
    },
    render: (props) => <ModernRetailServicesComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "ModernRetailServices",
  displayName: "Services",
  description: "Services",
  pageSetTypes: ["ENTITY"],
};
