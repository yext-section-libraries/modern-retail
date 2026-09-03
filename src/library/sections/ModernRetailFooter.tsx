import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  EntityField,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getThemeColorCssValue as resolveThemeColorCssValue,
  Image,
  resolveComponentData,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
  ThemeOptions,
  type TranslatableAssetImage,
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

type SharedImageFieldValue = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type FooterLinkValue = {
  label: YextEntityField<TranslatableString>;
  link: YextEntityField<TranslatableString>;
  openInNewTab: boolean;
};

type ModernRetailFooterProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  brand: {
    displayType: "text" | "logo";
    name: SharedTextFieldValue;
    logoSource: "entity" | "custom";
    logo: SharedImageFieldValue;
  };
  footerLinksStyles: StyledTextValue;
  footerLinks: FooterLinkValue[];
};

const defaultBrandLogoUrl =
  "https://a.mktgcdn.com/p/OLT2KExDEKhKlCmIobyRRHN6MFUS77fVs5gIt_FTnBI/450x450.jpg";

const defaultSectionBackgroundColor: ThemeColor = {
  selectedColor: "palette-secondary",
  contrastingColor: "palette-secondary-contrast",
};

const resolveSurfaceForegroundColor = (
  surfaceColor?: ThemeColor,
): string | undefined =>
  resolveThemeColorCssValue(getDefaultForegroundColor(surfaceColor));

const editorFieldStackStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
};

const editorFieldHeadingStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#4b5563",
};

const SegmentedSourceField = ({
  label = "Source",
  value,
  onChange,
}: {
  label?: string;
  value?: "entity" | "custom";
  onChange: (value: "entity" | "custom") => void;
}) => {
  const currentValue = value ?? "custom";
  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: "1 1 0",
    minWidth: 0,
    minHeight: "56px",
    border: "1px solid #d1d5db",
    background: isActive ? "#eef3ff" : "#ffffff",
    color: isActive ? "#0b5fc1" : "#4b5563",
    fontWeight: isActive ? 600 : 500,
    fontSize: "14px",
    lineHeight: 1.2,
    cursor: "pointer",
    padding: "8px 10px",
    whiteSpace: "normal",
    overflowWrap: "break-word",
    wordBreak: "normal",
  });

  return (
    <div style={editorFieldStackStyle}>
      <div style={editorFieldHeadingStyle}>{label}</div>
      <div
        role="group"
        aria-label={label}
        style={{
          display: "flex",
          flexWrap: "nowrap",
          width: "100%",
          minWidth: 0,
        }}
      >
        <button
          type="button"
          onClick={() => onChange("entity")}
          aria-pressed={currentValue === "entity"}
          aria-label={`${label}: Knowledge Graph`}
          style={buttonStyle(currentValue === "entity")}
        >
          Knowledge Graph
        </button>
        <button
          type="button"
          onClick={() => onChange("custom")}
          aria-pressed={currentValue === "custom"}
          aria-label={`${label}: Custom`}
          style={buttonStyle(currentValue === "custom")}
        >
          Custom
        </button>
      </div>
    </div>
  );
};

const toRenderableText = (value: unknown, fallback = "") => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    if ("text" in (value as Record<string, unknown>)) {
      const text = (value as Record<string, unknown>).text;
      if (typeof text === "string" || typeof text === "number") {
        return String(text);
      }
    }

    if ("defaultValue" in (value as Record<string, unknown>)) {
      const defaultValue = (value as Record<string, unknown>).defaultValue;
      if (
        typeof defaultValue === "string" ||
        typeof defaultValue === "number"
      ) {
        return String(defaultValue);
      }
    }
  }

  return fallback;
};

const resolveTextConstantValue = (
  field: YextEntityField<TranslatableString>,
  locale: string,
  streamDocument: StreamDocumentShape,
) =>
  toRenderableText(
    resolveComponentData(
      {
        field: "",
        constantValue: field.constantValue,
        constantValueEnabled: true,
      } as YextEntityField<TranslatableString>,
      locale,
      streamDocument,
    ),
    toRenderableText(field.constantValue, ""),
  ).trim();

const resolveTextFieldValue = (
  field: YextEntityField<TranslatableString>,
  locale: string,
  streamDocument: StreamDocumentShape,
) =>
  toRenderableText(
    resolveComponentData(field, locale, streamDocument),
    resolveTextConstantValue(field, locale, streamDocument),
  ).trim();

const getSharedTextStyle = (
  styles: StyledTextValue,
  color: string | undefined,
): React.CSSProperties => ({
  color,
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

const resolveImageConstantValue = (
  field: YextEntityField<TranslatableAssetImage>,
  locale: string,
  streamDocument: StreamDocumentShape,
) =>
  (resolveComponentData(
    {
      field: "",
      constantValue: field.constantValue,
      constantValueEnabled: true,
    } as YextEntityField<TranslatableAssetImage>,
    locale,
    streamDocument,
  ) ??
    field.constantValue) as
    | Exclude<TranslatableAssetImage, undefined>
    | undefined;

const resolveImageFieldValue = (
  field: YextEntityField<TranslatableAssetImage>,
  locale: string,
  streamDocument: StreamDocumentShape,
) =>
  (resolveComponentData(field, locale, streamDocument) ??
    resolveImageConstantValue(field, locale, streamDocument)) as
    | Exclude<TranslatableAssetImage, undefined>
    | undefined;

const defaultBrandName: SharedTextFieldValue = {
  text: {
    field: "name",
    constantValue: {
      defaultValue: "[[name]]",
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  styles: {
    fontFamily: "default",
    fontSize: "18.5px",
    fontWeight: "500",
    fontStyle: "default",
    textTransform: "uppercase",
  },
};

const defaultBrandLogo: SharedImageFieldValue = {
  image: {
    field: "",
    constantValue: {
      url: defaultBrandLogoUrl,
      width: 450,
      height: 450,
      alternateText: {
        defaultValue: "[[name]]",
        hasLocalizedValue: "true",
      },
    },
    constantValueEnabled: true,
  },
  aspectRatio: 0,
  imageConstrain: "fixed",
  styles: {
    borderRadius: "default",
  },
};

const defaultFooterLinksStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "16px",
  fontWeight: "400",
  fontStyle: "default",
  textTransform: "uppercase",
};

const createFooterLink = (label: string, link: string): FooterLinkValue => ({
  label: {
    field: "",
    constantValue: {
      defaultValue: label,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  link: {
    field: "",
    constantValue: {
      defaultValue: link,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  openInNewTab: false,
});

const footerFields: YextFields<ModernRetailFooterProps> = {
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
  brand: {
    label: "Brand",
    type: "object",
    objectFields: {
      displayType: {
        label: "Display Type",
        type: "radio",
        options: [
          { label: "Text", value: "text" },
          { label: "Logo", value: "logo" },
        ],
      },
      name: {
        label: "Brand Name",
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
      logoSource: {
        label: "Logo Source",
        type: "custom",
        render: ({ value, onChange }) => (
          <SegmentedSourceField
            label="Logo Source"
            value={value as "entity" | "custom" | undefined}
            onChange={onChange as (value: "entity" | "custom") => void}
          />
        ),
      },
      logo: {
        label: "Brand Logo",
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
    },
  },
  footerLinksStyles: {
    label: "Link Styling",
    type: "styledText",
  },
  footerLinks: {
    label: "Footer Links",
    type: "array",
    arrayFields: {
      label: {
        label: "Label",
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      },
      link: {
        label: "Link",
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      },
      openInNewTab: {
        label: "Open in New Tab",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
    defaultItemProps: createFooterLink("Link", "#"),
    getItemSummary: (item) =>
      toRenderableText(item.label?.constantValue, "Link"),
  },
};

const resolveFooterLink = (
  item: FooterLinkValue,
  locale: string,
  streamDocument: StreamDocumentShape,
) => {
  return {
    label: resolveTextFieldValue(item.label, locale, streamDocument),
    link: resolveTextFieldValue(item.link, locale, streamDocument),
    openInNewTab: item.openInNewTab,
  };
};

const ModernRetailFooterComponent: PuckComponent<ModernRetailFooterProps> = (
  props,
) => {
  const streamDocument =
    (useDocument() as StreamDocumentShape | undefined) ?? {};
  const locale = streamDocument.locale ?? "en";
  const sectionBackgroundColor =
    props.section.backgroundColor ?? defaultSectionBackgroundColor;
  const footerBackgroundColor =
    resolveThemeColorCssValue(sectionBackgroundColor);
  const footerForegroundColor =
    resolveSurfaceForegroundColor(sectionBackgroundColor);
  const entityBrandName = resolveTextFieldValue(
    props.brand.name.text,
    locale,
    streamDocument,
  );
  const customBrandName = resolveTextConstantValue(
    props.brand.name.text,
    locale,
    streamDocument,
  );
  const preferCustomBrandName =
    props.brand.name.text.constantValueEnabled === true;
  const brandName =
    preferCustomBrandName
      ? customBrandName || entityBrandName
      : entityBrandName || customBrandName;
  const resolvedBrandLogo =
    props.brand.logoSource === "entity"
      ? resolveImageFieldValue(props.brand.logo.image, locale, streamDocument)
      : resolveImageConstantValue(props.brand.logo.image, locale, streamDocument);
  const footerLinks = (props.footerLinks ?? []).map((row) =>
    resolveFooterLink(row, locale, streamDocument),
  );
  const brandNameColor =
    resolveThemeColorCssValue(props.brand.name.fontColor) ?? footerForegroundColor;
  const brandNameStyle: React.CSSProperties = {
    ...getSharedTextStyle(props.brand.name.styles, brandNameColor),
    letterSpacing: "0.14em",
  };
  const footerLinkStyle = getSharedTextStyle(
    props.footerLinksStyles,
    footerForegroundColor,
  );
  const brandLogoWrapperStyle: React.CSSProperties = {
    aspectRatio:
      props.brand.logo.aspectRatio > 0 ? props.brand.logo.aspectRatio : undefined,
    borderRadius:
      props.brand.logo.styles?.borderRadius === "default"
        ? undefined
        : props.brand.logo.styles?.borderRadius,
    overflow:
      props.brand.logo.imageConstrain === "filled" ||
      Boolean(
        props.brand.logo.styles?.borderRadius &&
          props.brand.logo.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
  };
  const desktopBrandLogoStyle: React.CSSProperties = {
    display: "block",
    height: "auto",
    maxHeight: "48px",
    objectFit: props.brand.logo.imageConstrain === "filled" ? "cover" : "contain",
    width: "100%",
  };
  const mobileBrandLogoStyle: React.CSSProperties = {
    ...desktopBrandLogoStyle,
    maxHeight: "40px",
  };

  return (
    <AnalyticsScopeProvider
      name={`ModernRetailFooter${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{`
          .ps-footer-layout {
            margin: 0 auto;
            max-width: 1200px;
            padding: 32px 16px 28px;
          }
          .footer-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 0;
          }
          .footer-grid__item {
            display: flex;
            flex: 0 0 100%;
            max-width: 100%;
            min-width: 0;
            padding: 0;
          }
          .footer-grid__item-inner {
            padding: 0;
          }
          .footer-wordmark {
            align-items: center;
            color: inherit;
            display: inline-flex;
            font-family: "Roboto Mono", "Courier New", monospace;
            font-size: 18.5px;
            font-weight: 500;
            letter-spacing: 0.14em;
            line-height: 1;
            text-transform: uppercase;
            white-space: nowrap;
          }
          .footer-block__menu {
            align-items: center;
            display: flex;
            flex-wrap: wrap;
            gap: 12px 24px;
            list-style: none;
            margin: 0;
            padding: 0;
          }
          .footer-block__menu-item {
            align-items: center;
            display: inline-flex;
            margin: 0;
          }
          .footer-block__menu-item:not(:last-child)::after {
            color: currentColor;
            content: "|";
            margin-left: 24px;
          }
          .footer-block__menu-link {
            align-items: center;
            display: inline-flex;
            font-family: "Roboto Mono", "Courier New", monospace;
            font-size: 16px;
            font-weight: 400;
            letter-spacing: 0.08em;
            line-height: 1;
            text-transform: uppercase;
          }
          .medium-hide,
          .large-up-hide {
            display: none;
          }
          .footer-row-1 {
            padding-bottom: 32px;
          }
          .footer-grid__item--brand {
            justify-content: flex-start;
            padding-bottom: 16px;
          }
          .footer-grid__item--nav {
            justify-content: flex-start;
            padding-bottom: 24px;
          }
          .ps-footer-shell a { color: inherit; text-decoration: none; }
          .ps-footer-shell a:hover,
          .ps-footer-shell a:focus-visible,
          .ps-footer-shell button:hover,
          .ps-footer-shell button:focus-visible {
            opacity: 0.84;
          }
          @media (max-width: 1024px) {
            .medium-hide,
            .large-up-hide {
              display: none !important;
            }
          }
          @media (max-width: 749px) {
            .small-hide {
              display: none !important;
            }
            .medium-hide,
            .large-up-hide {
              display: block !important;
            }
            .ps-footer-layout {
              padding: 24px 16px 24px;
            }
            .footer-wordmark {
              font-size: 12.5px;
              letter-spacing: 0.12em;
            }
            .footer-grid__item--brand,
            .footer-grid__item--nav {
              padding-bottom: 20px;
            }
            .footer-block__menu {
              gap: 10px 16px;
            }
            .footer-block__menu-item:not(:last-child)::after {
              margin-left: 16px;
            }
          }
        `}</style>
        <div
          id="theme-section-sections--25351194345786__footer"
          className="theme-section theme-section-group-footer-group"
          style={{
            backgroundColor: footerBackgroundColor,
            color: footerForegroundColor,
          }}
        >
          <div
            className=""
            style={
              {
                "--ps-footer-bg": footerBackgroundColor,
                "--ps-footer-fg": footerForegroundColor,
                backgroundColor: footerBackgroundColor,
                color: footerForegroundColor,
              } as React.CSSProperties
            }
          >
            <footer
              className="footer-section ps-footer-shell"
              style={{
                backgroundColor: footerBackgroundColor,
                color: footerForegroundColor,
              }}
            >
              <div className="footer-row-1 ps-footer-layout">
                <div className="footer-grid">
                  <div className="footer-grid__item footer-grid__item--brand small-hide">
                    <div aria-label={brandName} className="footer-wordmark">
                      {props.brand.displayType === "logo" && resolvedBrandLogo ? (
                        <EntityField
                          displayName="Brand Logo"
                          fieldId={props.brand.logo.image.field}
                          constantValueEnabled={
                            props.brand.logo.image.constantValueEnabled
                          }
                        >
                          <div style={brandLogoWrapperStyle}>
                            <Image
                              image={resolvedBrandLogo}
                              style={desktopBrandLogoStyle}
                            />
                          </div>
                        </EntityField>
                      ) : (
                        <EntityField
                          displayName="Brand Name"
                          fieldId={props.brand.name.text.field}
                          constantValueEnabled={props.brand.name.text.constantValueEnabled}
                        >
                          <span className="header__logo-text" style={brandNameStyle}>
                            {brandName.toUpperCase()}
                          </span>
                        </EntityField>
                      )}
                    </div>
                  </div>
                  <div className="footer-grid__item footer-grid__item--nav">
                    <ul className="footer-block__menu footer-block__menu--compact list-unstyled">
                      {footerLinks.map((row, index) => (
                        <li
                          key={`${row.label}-${index}`}
                          className="footer-block__menu-item"
                        >
                          <EntityField
                            displayName="Footer Link"
                            fieldId={props.footerLinks[index].link.field}
                            constantValueEnabled={
                              props.footerLinks[index].link.constantValueEnabled
                            }
                          >
                            <Link
                              cta={{ link: row.link, linkType: "URL" }}
                              className="footer-block__menu-link inline-richtext subheading text-color text-uppercase accent-font"
                              eventName={`footerlink${index}`}
                              rel={
                                row.openInNewTab
                                  ? "noreferrer noopener"
                                  : undefined
                              }
                              style={{
                                color: footerForegroundColor,
                                ...footerLinkStyle,
                              }}
                              target={row.openInNewTab ? "_blank" : undefined}
                            >
                              <EntityField
                                displayName="Footer Link Label"
                                fieldId={props.footerLinks[index].label.field}
                                constantValueEnabled={
                                  props.footerLinks[index].label
                                    .constantValueEnabled
                                }
                              >
                                <span className="footer-block__menu-link-text link-animation">
                                  {row.label}
                                </span>
                              </EntityField>
                            </Link>
                          </EntityField>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="footer-grid__item footer-grid__item--brand large-up-hide medium-hide">
                    <div aria-label={brandName} className="footer-wordmark">
                      {props.brand.displayType === "logo" && resolvedBrandLogo ? (
                        <EntityField
                          displayName="Brand Logo"
                          fieldId={props.brand.logo.image.field}
                          constantValueEnabled={
                            props.brand.logo.image.constantValueEnabled
                          }
                        >
                          <div style={brandLogoWrapperStyle}>
                            <Image
                              image={resolvedBrandLogo}
                              style={mobileBrandLogoStyle}
                            />
                          </div>
                        </EntityField>
                      ) : (
                        <EntityField
                          displayName="Brand Name"
                          fieldId={props.brand.name.text.field}
                          constantValueEnabled={props.brand.name.text.constantValueEnabled}
                        >
                          <span className="header__logo-text" style={brandNameStyle}>
                            {brandName.toUpperCase()}
                          </span>
                        </EntityField>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const ModernRetailFooter: YextComponentConfig<ModernRetailFooterProps> =
  {
    label: "Footer",
    fields: footerFields,
    resolveFields: (data) => ({
      ...footerFields,
      brand: {
        ...footerFields.brand,
        objectFields: {
          ...footerFields.brand.objectFields,
          name: {
            ...footerFields.brand.objectFields.name,
            visible: data.props.brand?.displayType !== "logo",
          },
          logoSource: {
            ...footerFields.brand.objectFields.logoSource,
            visible: data.props.brand?.displayType === "logo",
          },
          logo: {
            ...footerFields.brand.objectFields.logo,
            visible: data.props.brand?.displayType === "logo",
          },
        },
      },
    }),
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: defaultSectionBackgroundColor,
      },
      brand: {
        displayType: "text",
        name: defaultBrandName,
        logoSource: "custom",
        logo: defaultBrandLogo,
      },
      footerLinksStyles: defaultFooterLinksStyles,
      footerLinks: [
        createFooterLink("Departments", "#"),
        createFooterLink("Shopping Services", "#modern-retail-services"),
        createFooterLink("Locations", "#modern-retail-location-details"),
        createFooterLink("Returns", "#"),
        createFooterLink("Contact", "#"),
      ],
    },
    render: (props) => <ModernRetailFooterComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "ModernRetailFooter",
  displayName: "Footer",
  description: "Footer",
  pageSetTypes: ["ENTITY", "DIRECTORY", "LOCATOR"],
};
