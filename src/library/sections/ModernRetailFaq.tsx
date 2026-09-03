import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  createItemSource,
  EntityField,
  MaybeRTF,
  getDefaultRTF,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getThemeColorCssValue as resolveThemeColorCssValue,
  resolveComponentData,
  type RichText,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  useDocument,
  VisibilityWrapper,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";

type SharedTextFieldValue = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type FaqItem = {
  question: YextEntityField<TranslatableString>;
  answer: YextEntityField<TranslatableRichText>;
};

type ModernRetailFaqProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  heading: SharedTextFieldValue;
  question: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  answer: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  activeFaqFontColor?: ThemeColor;
  faqs: typeof faqSource.value;
};

const resolveSurfaceForegroundColor = (
  surfaceColor?: ThemeColor,
): string | undefined =>
  resolveThemeColorCssValue(getDefaultForegroundColor(surfaceColor));

const getSharedTextStyle = (
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
      defaultValue: "Frequently Asked Questions",
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
};

const defaultQuestion: ModernRetailFaqProps["question"] = {
  styles: {
    fontFamily: "default",
    fontSize: "clamp(16px, 1.5vw, 20px)",
    fontWeight: "500",
    fontStyle: "default",
    textTransform: "default",
  },
};

const defaultAnswer: ModernRetailFaqProps["answer"] = {
  styles: {
    fontFamily: "default",
    fontSize: "16px",
    fontWeight: "default",
    fontStyle: "default",
    textTransform: "default",
  },
};

const createDefaultQuestion = (
  text: string,
): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: {
    defaultValue: text,
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

const createDefaultAnswer = (
  text: string,
): YextEntityField<TranslatableRichText> => ({
  field: "",
  constantValue: {
    defaultValue: getDefaultRTF(text),
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

const defaultFaqs: FaqItem[] = [
  {
    question: createDefaultQuestion("Do I need an appointment for support?"),
    answer: createDefaultAnswer(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi curabitur laoreet fermentum tortor.",
    ),
  },
  {
    question: createDefaultQuestion("Where is the best place to start?"),
    answer: createDefaultAnswer(
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    ),
  },
  {
    question: createDefaultQuestion("Can I update an earlier request here?"),
    answer: createDefaultAnswer(
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.",
    ),
  },
  {
    question: createDefaultQuestion("Do you offer concierge pickup?"),
    answer: createDefaultAnswer(
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
    ),
  },
  {
    question: createDefaultQuestion(
      "Is tailoring available for outside items?",
    ),
    answer: createDefaultAnswer(
      "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.",
    ),
  },
];

const faqSource = createItemSource<FaqItem>({
  label: "FAQs",
  mappingFields: {
    question: {
      label: "Question",
      type: "entityField",
      filter: {
        types: ["type.string"],
      },
    },
    answer: {
      label: "Answer",
      type: "entityField",
      filter: {
        types: ["type.rich_text_v2"],
      },
    },
  },
  defaultValues: defaultFaqs,
});

const faqFields: YextFields<ModernRetailFaqProps> = {
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
  question: {
    label: "Question",
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
  answer: {
    label: "Answer",
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
  activeFaqFontColor: {
    label: "Active FAQ Font Color",
    type: "basicSelector",
    options: "SITE_COLOR",
  },
  faqs: faqSource.field,
};

const ModernRetailFaqComponent: PuckComponent<ModernRetailFaqProps> = (
  props,
) => {
  const [openIndex, setOpenIndex] = React.useState(0);
  const streamDocument = useDocument<any>();
  const locale = streamDocument?.locale ?? "en";
  const resolvedHeadingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const faqs = faqSource
    .resolveItems(props.faqs, streamDocument)
    .map((item) => {
      const resolvedQuestion = item.question
        ? resolveComponentData(item.question, locale, streamDocument, {
            output: "plainText",
          })
        : "";
      const resolvedAnswer = item.answer
        ? resolveComponentData(item.answer, locale, streamDocument, {
            richTextStyleOverrides: {
              ...props.answer.styles,
              color: resolveThemeColorCssValue(props.answer.fontColor),
            },
          })
        : undefined;

      return {
        ...item,
        resolvedQuestion,
        resolvedAnswer,
      };
    });

  return (
    <AnalyticsScopeProvider
      name={`ModernRetailFaq${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{`
          .ps-faq-shell .ps-faq-item {
            border-bottom: 1px solid currentColor;
          }
          .ps-faq-shell .ps-faq-trigger {
            align-items: center;
            background: transparent;
            border: 0;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            padding: 20px 0;
            text-align: left;
            width: 100%;
          }
          .ps-faq-shell .ps-faq-icon::before {
            content: "+";
          }
          .ps-faq-shell .ps-faq-item.is-open .ps-faq-icon::before {
            content: "×";
          }
          .ps-faq-shell .ps-faq-panel {
            display: none;
          }
          .ps-faq-shell .ps-faq-item.is-open .ps-faq-panel {
            display: block;
          }
          .ps-faq-shell .ps-faq-panel-inner {
            padding: 0 0 20px;
          }
          .ps-faq-shell .ps-faq-panel-inner p {
            margin: 0;
          }
        `}</style>
        <section
          className="ps-faq-shell"
          style={{
            backgroundColor: resolveThemeColorCssValue(
              props.section.backgroundColor,
            ),
            color: resolveSurfaceForegroundColor(props.section.backgroundColor),
            padding: "48px 0",
          }}
        >
          <div
            style={{ margin: "0 auto", maxWidth: "1200px", padding: "0 16px" }}
          >
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                style={{
                  ...getSharedTextStyle(
                    props.heading.styles,
                    props.heading.fontColor,
                  ),
                  letterSpacing: "-0.04em",
                  lineHeight: 1.08,
                  margin: "0 0 28px",
                  textAlign: "center",
                }}
              >
                {resolvedHeadingText}
              </h2>
            </EntityField>
            <div style={{ margin: "0 auto", maxWidth: "800px" }}>
              <EntityField
                displayName="FAQs"
                fieldId={props.faqs.field}
                constantValueEnabled={props.faqs.constantValueEnabled}
              >
                <div>
                  {faqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    const activeColor = isOpen
                      ? resolveThemeColorCssValue(props.activeFaqFontColor)
                      : undefined;
                    return (
                      <article
                        key={`${faq.resolvedQuestion}-${index}`}
                        className={`ps-faq-item${isOpen ? " is-open" : ""}`}
                      >
                        <button
                          className="ps-faq-trigger"
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenIndex(isOpen ? -1 : index)}
                          style={{
                            color:
                              activeColor ??
                              resolveThemeColorCssValue(
                                props.question.fontColor,
                              ),
                          }}
                        >
                          <span
                            className="ps-faq-label"
                            style={{
                              ...getSharedTextStyle(
                                props.question.styles,
                                props.question.fontColor,
                              ),
                              color:
                                activeColor ??
                                resolveThemeColorCssValue(
                                  props.question.fontColor,
                                ),
                              lineHeight: 1.2,
                            }}
                          >
                            {faq.resolvedQuestion}
                          </span>
                          <span
                            className="ps-faq-icon"
                            aria-hidden="true"
                            style={{
                              fontSize: "16px",
                              lineHeight: 1,
                              marginLeft: "12px",
                            }}
                          />
                        </button>
                        <div className="ps-faq-panel">
                          <div
                            className="ps-faq-panel-inner"
                            style={{
                              ...getSharedTextStyle(
                                props.answer.styles,
                                props.answer.fontColor,
                              ),
                              color:
                                activeColor ??
                                resolveThemeColorCssValue(
                                  props.answer.fontColor,
                                ),
                            }}
                          >
                            {React.isValidElement(faq.resolvedAnswer) ? (
                              faq.resolvedAnswer
                            ) : (
                              <MaybeRTF
                                data={
                                  faq.resolvedAnswer as
                                    string | RichText | undefined
                                }
                                richTextStyleOverrides={{
                                  ...props.answer.styles,
                                  color:
                                    activeColor ??
                                    resolveThemeColorCssValue(
                                      props.answer.fontColor,
                                    ),
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </EntityField>
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const ModernRetailFaq: YextComponentConfig<ModernRetailFaqProps> = {
  label: "FAQ",
  fields: faqFields,
  defaultProps: {
    section: {
      visibleOnLivePage: true,
      backgroundColor: {
        selectedColor: "white",
        contrastingColor: "palette-quaternary",
      },
    },
    heading: defaultHeading,
    question: defaultQuestion,
    answer: defaultAnswer,
    faqs: faqSource.defaultValue,
  },
  render: (props) => <ModernRetailFaqComponent {...props} />,
};

export const config: SectionConfig = {
  id: "ModernRetailFaq",
  displayName: "FAQ",
  description: "FAQ",
  pageSetTypes: ["ENTITY"],
};
