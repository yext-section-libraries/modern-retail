import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  EntityField,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getThemeColorCssValue as resolveThemeColorCssValue,
  resolveBreadcrumbs,
  resolveComponentData,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  useDocument,
  useTemplateProps,
  VisibilityWrapper,
} from "@yext/visual-editor";

type StreamDocumentShape = {
  locale?: string;
  name?: string;
  address?: {
    line1?: string;
  };
};

type SharedTextFieldValue = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type ModernRetailBreadcrumbsProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  rootLabel: SharedTextFieldValue;
  links: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  currentPage: {
    includeCurrentPage: boolean;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
};

type ResolvedBreadcrumb = {
  name: string;
  slug: string;
};

type RenderBreadcrumb = {
  key: string;
  label: string;
  href: string;
  isCurrentPage: boolean;
  isRoot: boolean;
};

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

const normalizeText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const normalizeCompareValue = (value: string): string =>
  value.trim().toLowerCase();

const defaultRootLabel: SharedTextFieldValue = {
  text: {
    field: "",
    constantValue: {
      defaultValue: "All Locations",
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  styles: {
    fontFamily: "default",
    fontSize: "13px",
    fontWeight: "600",
    fontStyle: "default",
    textTransform: "uppercase",
  },
  fontColor: undefined,
};

const defaultLinks: ModernRetailBreadcrumbsProps["links"] = {
  styles: {
    fontFamily: "default",
    fontSize: "13px",
    fontWeight: "500",
    fontStyle: "default",
    textTransform: "uppercase",
  },
  fontColor: undefined,
};

const defaultCurrentPage: ModernRetailBreadcrumbsProps["currentPage"] = {
  includeCurrentPage: true,
  styles: {
    fontFamily: "default",
    fontSize: "13px",
    fontWeight: "600",
    fontStyle: "default",
    textTransform: "uppercase",
  },
  fontColor: undefined,
};

const breadcrumbsFields: YextFields<ModernRetailBreadcrumbsProps> = {
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
  rootLabel: {
    label: "Root Label",
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
  links: {
    label: "Breadcrumb Links",
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
  currentPage: {
    label: "Current Page",
    type: "object",
    objectFields: {
      includeCurrentPage: {
        label: "Include Current Location",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
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
};

const ModernRetailBreadcrumbsComponent: PuckComponent<
  ModernRetailBreadcrumbsProps
> = (props) => {
  const streamDocument = useDocument<StreamDocumentShape>();
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const locale = streamDocument.locale ?? "en";
  const rootLabelOverride = normalizeText(
    resolveComponentData(props.rootLabel.text, locale, streamDocument),
  );
  const currentPageLabel =
    normalizeText(streamDocument.name) ||
    normalizeText(streamDocument.address?.line1);
  const sectionForeground = resolveSurfaceForegroundColor(
    props.section.backgroundColor,
  );
  const resolvedBreadcrumbs = (resolveBreadcrumbs(streamDocument) ?? [])
    .map((item): ResolvedBreadcrumb => {
      const candidate = item as { name?: unknown; slug?: unknown };
      return {
        name: normalizeText(candidate.name),
        slug: typeof candidate.slug === "string" ? candidate.slug : "",
      };
    })
    .filter((item) => item.name || item.slug);

  if (!resolvedBreadcrumbs.length) {
    return props.puck.isEditing ? (
      <p
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "18px 24px",
        }}
      >
        No breadcrumbs available (section will be hidden on live page). Create a
        directory to enable breadcrumbs.
      </p>
    ) : (
      <></>
    );
  }

  const lastResolvedBreadcrumb =
    resolvedBreadcrumbs[resolvedBreadcrumbs.length - 1];
  const breadcrumbsIncludeCurrentPage =
    resolvedBreadcrumbs.length > 1 &&
    Boolean(currentPageLabel) &&
    normalizeCompareValue(lastResolvedBreadcrumb?.name ?? "") ===
      normalizeCompareValue(currentPageLabel);
  const directoryBreadcrumbs = breadcrumbsIncludeCurrentPage
    ? resolvedBreadcrumbs.slice(0, -1)
    : resolvedBreadcrumbs;

  const breadcrumbItems: RenderBreadcrumb[] = directoryBreadcrumbs.map(
    (item, index) => ({
      key: item.slug || `${item.name}-${index}`,
      label: index === 0 && rootLabelOverride ? rootLabelOverride : item.name,
      href: relativePrefixToRoot
        ? `${relativePrefixToRoot}${item.slug}`
        : item.slug || "",
      isCurrentPage: false,
      isRoot: index === 0,
    }),
  );

  if (props.currentPage.includeCurrentPage && currentPageLabel) {
    breadcrumbItems.push({
      key: "current-page",
      label: currentPageLabel,
      href: "",
      isCurrentPage: true,
      isRoot: false,
    });
  }

  const breadcrumbsStyles = `
    .ps-breadcrumbs-layout {
      max-width: 1200px;
      margin: 0 auto;
      padding: 18px 24px;
    }
    .ps-breadcrumbs-trail {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .ps-breadcrumbs-item {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .ps-breadcrumbs-link,
    .ps-breadcrumbs-current {
      display: inline-flex;
      align-items: center;
      min-width: 0;
      text-decoration: none;
      letter-spacing: 0.12em;
      line-height: 1.25;
    }
    .ps-breadcrumbs-link {
      transition: opacity 0.2s ease;
    }
    .ps-breadcrumbs-link:hover {
      opacity: 0.68;
    }
    .ps-breadcrumbs-separator {
      opacity: 0.4;
      font-size: 12px;
      line-height: 1;
    }
    .ps-breadcrumbs-empty {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.12em;
      line-height: 1.4;
      text-transform: uppercase;
      opacity: 0.68;
    }
    @media (max-width: 749px) {
      .ps-breadcrumbs-layout {
        padding: 16px 20px;
      }
      .ps-breadcrumbs-trail,
      .ps-breadcrumbs-item {
        gap: 8px;
      }
    }
  `;

  return (
    <AnalyticsScopeProvider
      name={`ModernRetailBreadcrumbs${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{breadcrumbsStyles}</style>
        <section
          id="theme-section-template--25351194706234__section_breadcrumbs"
          className="theme-section"
          style={{
            backgroundColor: resolveThemeColorCssValue(
              props.section.backgroundColor,
            ),
            color: sectionForeground,
          }}
        >
          <div
            className="ps-breadcrumbs-layout"
            style={{
              borderBottom: "1px solid rgba(17, 24, 39, 0.14)",
            }}
          >
            <ol className="ps-breadcrumbs-trail">
              {breadcrumbItems.map((item, index) => {
                const hasResolvedHref = item.href.trim().length > 0;
                const sharedTextStyle = item.isCurrentPage
                  ? {
                      ...getTextStyles(
                        props.currentPage.styles,
                        props.currentPage.fontColor,
                      ),
                      color:
                        resolveThemeColorCssValue(
                          props.currentPage.fontColor,
                        ) ?? sectionForeground,
                      opacity: 0.82,
                    }
                  : item.isRoot
                    ? {
                        ...getTextStyles(
                          props.rootLabel.styles,
                          props.rootLabel.fontColor,
                        ),
                        color:
                          resolveThemeColorCssValue(
                            props.rootLabel.fontColor,
                          ) ?? sectionForeground,
                      }
                    : {
                        ...getTextStyles(
                          props.links.styles,
                          props.links.fontColor,
                        ),
                        color:
                          resolveThemeColorCssValue(props.links.fontColor) ??
                          sectionForeground,
                      };

                const labelMarkup = item.isCurrentPage ? (
                  <span
                    className="ps-breadcrumbs-current"
                    aria-current="page"
                    style={sharedTextStyle}
                  >
                    {item.label}
                  </span>
                ) : hasResolvedHref && !props.puck.isEditing ? (
                    <Link
                      className="ps-breadcrumbs-link"
                      eventName={`breadcrumbLink${index + 1}`}
                      href={item.href}
                      style={sharedTextStyle}
                    >
                      {item.label}
                    </Link>
                  ) : (
                  <span
                    className="ps-breadcrumbs-current"
                    style={sharedTextStyle}
                  >
                      {item.label}
                    </span>
                );

                return (
                  <li className="ps-breadcrumbs-item" key={item.key}>
                    {index > 0 ? (
                      <span className="ps-breadcrumbs-separator" aria-hidden>
                        /
                      </span>
                    ) : null}
                    {item.isRoot ? (
                      <EntityField
                        displayName="Root Label"
                        fieldId={props.rootLabel.text.field}
                        constantValueEnabled={
                          props.rootLabel.text.constantValueEnabled
                        }
                      >
                        {labelMarkup}
                      </EntityField>
                    ) : (
                      labelMarkup
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const ModernRetailBreadcrumbs: YextComponentConfig<ModernRetailBreadcrumbsProps> =
  {
  label: "Breadcrumbs",
  fields: breadcrumbsFields,
  defaultProps: {
    section: {
      visibleOnLivePage: true,
      backgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
    },
    rootLabel: defaultRootLabel,
    links: defaultLinks,
    currentPage: defaultCurrentPage,
  },
  render: (props) => <ModernRetailBreadcrumbsComponent {...props} />,
};

export const config: SectionConfig = {
  id: "ModernRetailBreadcrumbs",
  displayName: "Breadcrumbs",
  description: "Breadcrumbs",
  pageSetTypes: ["ENTITY"],
};
