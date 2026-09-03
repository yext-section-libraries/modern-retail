import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { parsePhoneNumber } from "awesome-phonenumber";
import {
  Address,
  AnalyticsScopeProvider,
  HoursStatus,
  HoursTable,
  Link,
  type AddressType,
  type HoursType,
  type StatusParams,
} from "@yext/pages-components";
import {
  ComprehensiveCTA,
  createItemSource,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getThemeColorCssValue as resolveThemeColorCssValue,
  resolveComponentData,
  type ComprehensiveCTAValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  useDocument,
  VisibilityWrapper,
} from "@yext/visual-editor";

type StreamDocumentShape = {
  businessId?: string | number;
  uid?: string | number;
  locale?: string;
  additionalHoursText?: string;
  timezone?: string;
  comingSoon?: boolean;
  _yext?: {
    platformDomain?: string;
  };
};

type SharedTextFieldValue = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type DetailsAddress = {
  subheading: YextEntityField<TranslatableString>;
  address: YextEntityField<AddressType>;
  showRegion: boolean;
  showCountry: boolean;
};

type DetailsPhoneItem = {
  number: YextEntityField<string>;
  label?: string;
};

type DetailsPhone = {
  subheading: YextEntityField<TranslatableString>;
  items: DetailsPhoneItem[];
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type DetailsOfferingItem = {
  text: YextEntityField<TranslatableString>;
  status: YextEntityField<TranslatableString>;
};

type HoursStyles = {
  startOfWeek:
    | "today"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  collapseDays: boolean;
  showAdditionalHoursText: boolean;
  alignment: "items-start" | "items-center" | "items-end";
  showCurrentStatus: boolean;
  timeFormat: "12h" | "24h";
  dayOfWeekFormat: "short" | "long";
  showDayNames: boolean;
};

type ModernRetailDetailsProps = {
  section: {
    backgroundColor: ThemeColor;
    cardBackgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  data: {
    sectionHeading: YextEntityField<TranslatableString>;
    info: {
      heading: YextEntityField<TranslatableString>;
      address: DetailsAddress;
      phone: DetailsPhone;
      primaryCta: ComprehensiveCTAValue;
      secondaryCta: ComprehensiveCTAValue;
    };
    hours: {
      heading: YextEntityField<TranslatableString>;
      hours: YextEntityField<HoursType>;
      hoursStyles: HoursStyles;
    };
    services: {
      heading: YextEntityField<TranslatableString>;
      items: typeof detailsOfferingsSource.value;
    };
  };
  styles: {
    sectionHeading: {
      styles: StyledTextValue;
      fontColor?: ThemeColor;
    };
    heading: {
      styles: StyledTextValue;
      fontColor?: ThemeColor;
    };
    address: {
      subheadingFontColor?: ThemeColor;
      contentFontColor?: ThemeColor;
    };
    phone: {
      subheadingFontColor?: ThemeColor;
      contentFontColor?: ThemeColor;
    };
    services: {
      fontColor?: ThemeColor;
    };
  };
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

const formatPhoneValue = (
  phoneNumberString: string,
  format: DetailsPhone["phoneFormat"],
) => {
  const cleanedPhoneNumberString = phoneNumberString.replace(
    /(?!^\+)\+|[^\d+]/g,
    "",
  );
  const parsedPhoneNumber = parsePhoneNumber(cleanedPhoneNumberString);

  if (!parsedPhoneNumber.valid || parsedPhoneNumber.number === undefined) {
    return phoneNumberString;
  }

  return format === "international"
    ? parsedPhoneNumber.number.international
    : parsedPhoneNumber.number.national;
};

const defaultDetailsHeading: SharedTextFieldValue = {
  text: {
    field: "",
    constantValue: {
      defaultValue: "Store Details",
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

const defaultInfoHeading: YextEntityField<TranslatableString> = {
  field: "",
  constantValue: {
    defaultValue: "Location Information",
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
};

const defaultHoursHeading: YextEntityField<TranslatableString> = {
  field: "",
  constantValue: {
    defaultValue: "Store Hours",
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
};

const defaultServicesHeading: YextEntityField<TranslatableString> = {
  field: "",
  constantValue: {
    defaultValue: "Services",
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
};

const defaultCardHeadingStyles: ModernRetailDetailsProps["styles"]["heading"] =
  {
    styles: {
      fontFamily: "default",
      fontSize: "20px",
      fontWeight: "700",
      fontStyle: "default",
      textTransform: "default",
    },
  };

const defaultDetailsAddress: DetailsAddress = {
  subheading: {
    field: "",
    constantValue: {
      defaultValue: "Address",
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  address: {
    field: "address",
    constantValue: {
      line1: "",
      city: "",
      postalCode: "",
      countryCode: "",
      region: "",
    },
    constantValueEnabled: false,
  },
  showRegion: true,
  showCountry: false,
};

const defaultDetailsPhone: DetailsPhone = {
  subheading: {
    field: "",
    constantValue: {
      defaultValue: "Phone",
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  items: [
    {
      number: {
        field: "mainPhone",
        constantValue: "",
        constantValueEnabled: false,
      },
      label: "",
    },
  ],
  phoneFormat: "domestic",
  includeHyperlink: false,
};

const defaultPrimaryCta: ComprehensiveCTAValue = {
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label: {
          defaultValue: "Visit Website",
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

const defaultSecondaryCta: ComprehensiveCTAValue = {
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label: {
          defaultValue: "Get Directions",
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

const defaultOfferings: DetailsOfferingItem[] = [
  {
    status: {
      field: "",
      constantValue: { defaultValue: "check", hasLocalizedValue: "true" },
      constantValueEnabled: true,
    },
    text: {
      field: "",
      constantValue: {
        defaultValue: "Lorem ipsum personal styling",
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
  },
  {
    status: {
      field: "",
      constantValue: { defaultValue: "check", hasLocalizedValue: "true" },
      constantValueEnabled: true,
    },
    text: {
      field: "",
      constantValue: {
        defaultValue: "Dolor fitting room requests",
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
  },
  {
    status: {
      field: "",
      constantValue: { defaultValue: "check", hasLocalizedValue: "true" },
      constantValueEnabled: true,
    },
    text: {
      field: "",
      constantValue: {
        defaultValue: "Amet in-store convenience",
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
  },
  {
    status: {
      field: "",
      constantValue: { defaultValue: "check", hasLocalizedValue: "true" },
      constantValueEnabled: true,
    },
    text: {
      field: "",
      constantValue: {
        defaultValue: "Consectetur mobile checkout",
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
  },
  {
    status: {
      field: "",
      constantValue: { defaultValue: "check", hasLocalizedValue: "true" },
      constantValueEnabled: true,
    },
    text: {
      field: "",
      constantValue: {
        defaultValue: "Adipiscing wrap station",
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
  },
];

const detailsOfferingsSource = createItemSource<DetailsOfferingItem>({
  label: "Services",
  mappingFields: {
    text: {
      type: "entityField",
      label: "Text",
      filter: {
        types: ["type.string"],
      },
    },
    status: {
      label: "Status",
      type: "entityField",
      filter: {
        types: ["type.string"],
      },
    },
  },
  defaultValues: defaultOfferings,
});

const defaultCardBackgroundColor: ThemeColor = {
  selectedColor: "white",
  contrastingColor: "palette-quaternary",
};

const detailsFields: YextFields<ModernRetailDetailsProps> = {
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
      sectionHeading: {
        label: "Section Heading",
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      },
      info: {
        label: "Info Card",
        type: "object",
        objectFields: {
          heading: {
            label: "Heading",
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          },
          address: {
            label: "Address",
            type: "object",
            objectFields: {
              subheading: {
                type: "entityField",
                label: "Subheading",
                filter: {
                  types: ["type.string"],
                },
              },
              address: {
                type: "entityField",
                label: "Address",
                filter: {
                  types: ["type.address"],
                },
              },
              showRegion: {
                label: "Show Region",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
              showCountry: {
                label: "Show Country",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
            },
          },
          phone: {
            label: "Phone",
            type: "object",
            objectFields: {
              subheading: {
                type: "entityField",
                label: "Subheading",
                filter: {
                  types: ["type.string"],
                },
              },
              items: {
                label: "Items",
                type: "array",
                arrayFields: {
                  number: {
                    type: "entityField",
                    label: "Number",
                    filter: {
                      types: ["type.phone"],
                    },
                  },
                  label: {
                    label: "Label",
                    type: "text",
                  },
                },
                defaultItemProps: {
                  number: {
                    field: "",
                    constantValue: "",
                    constantValueEnabled: true,
                  },
                  label: "",
                },
                getItemSummary: (item) =>
                  item.label ||
                  item.number?.constantValue ||
                  item.number?.field ||
                  "Phone",
              },
              phoneFormat: {
                label: "Phone Format",
                type: "radio",
                options: [
                  { label: "Domestic", value: "domestic" },
                  { label: "International", value: "international" },
                ],
              },
              includeHyperlink: {
                label: "Include Hyperlink",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
            },
          },
          primaryCta: {
            label: "Primary CTA",
            type: "comprehensiveCTA",
          },
          secondaryCta: {
            label: "Secondary CTA",
            type: "comprehensiveCTA",
          },
        },
      },
      hours: {
        label: "Hours Card",
        type: "object",
        objectFields: {
          heading: {
            label: "Heading",
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          },
          hours: {
            label: "Hours",
            type: "entityField",
            filter: {
              types: ["type.hours"],
            },
            disableConstantValueToggle: true,
          },
          hoursStyles: {
            label: "Hours Options",
            type: "object",
            objectFields: {
              startOfWeek: {
                label: "Start Of Week",
                type: "select",
                options: [
                  { label: "Monday", value: "monday" },
                  { label: "Tuesday", value: "tuesday" },
                  { label: "Wednesday", value: "wednesday" },
                  { label: "Thursday", value: "thursday" },
                  { label: "Friday", value: "friday" },
                  { label: "Saturday", value: "saturday" },
                  { label: "Sunday", value: "sunday" },
                  { label: "Today", value: "today" },
                ],
              },
              collapseDays: {
                label: "Collapse Days",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
              showAdditionalHoursText: {
                label: "Show Additional Hours Text",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
              alignment: {
                label: "Alignment",
                type: "select",
                options: [
                  { label: "Start", value: "items-start" },
                  { label: "Center", value: "items-center" },
                  { label: "End", value: "items-end" },
                ],
              },
              showCurrentStatus: {
                label: "Show Current Status",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
              timeFormat: {
                label: "Time Format",
                type: "select",
                options: [
                  { label: "12 Hour", value: "12h" },
                  { label: "24 Hour", value: "24h" },
                ],
              },
              dayOfWeekFormat: {
                label: "Day Of Week Format",
                type: "select",
                options: [
                  { label: "Short", value: "short" },
                  { label: "Long", value: "long" },
                ],
              },
              showDayNames: {
                label: "Show Day Names",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
            },
          },
        },
      },
      services: {
        label: "Services Card",
        type: "object",
        objectFields: {
          heading: {
            label: "Heading",
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          },
          items: detailsOfferingsSource.field,
        },
      },
    },
  },
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      sectionHeading: {
        label: "Section Heading",
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
      address: {
        label: "Address",
        type: "object",
        objectFields: {
          subheadingFontColor: {
            label: "Subheading Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
          contentFontColor: {
            label: "Content Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      phone: {
        label: "Phone",
        type: "object",
        objectFields: {
          subheadingFontColor: {
            label: "Subheading Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
          contentFontColor: {
            label: "Content Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      services: {
        label: "Services",
        type: "object",
        objectFields: {
          fontColor: {
            label: "Font and Icon Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
    },
  },
};

const ModernRetailDetailsComponent: PuckComponent<ModernRetailDetailsProps> = (
  props,
) => {
  const streamDocument =
    (useDocument() as StreamDocumentShape | undefined) ?? {};
  const locale = streamDocument.locale ?? "en";
  const headingColor =
    resolveThemeColorCssValue(props.styles.sectionHeading.fontColor) ||
    resolveSurfaceForegroundColor(props.section.backgroundColor);
  const cardForeground = resolveSurfaceForegroundColor(
    props.section.cardBackgroundColor,
  );
  const cardBackgroundColor = resolveThemeColorCssValue(
    props.section.cardBackgroundColor,
  );
  const resolvedHeadingText =
    resolveComponentData(props.data.sectionHeading, locale, streamDocument) ||
    "";
  const resolvedInfoHeading =
    resolveComponentData(props.data.info.heading, locale, streamDocument) || "";
  const resolvedHoursHeading =
    resolveComponentData(props.data.hours.heading, locale, streamDocument) ||
    "";
  const resolvedServicesHeading =
    resolveComponentData(props.data.services.heading, locale, streamDocument) ||
    "";
  const resolvedAddressSubheading =
    resolveComponentData(
      props.data.info.address.subheading,
      locale,
      streamDocument,
    ) || "";
  const resolvedAddress = resolveComponentData(
    props.data.info.address.address,
    locale,
    streamDocument,
  );
  const resolvedPhoneSubheading =
    resolveComponentData(
      props.data.info.phone.subheading,
      locale,
      streamDocument,
    ) || "";
  const resolvedPhoneItems = (props.data.info.phone.items ?? [])
    .map((item) => {
      const resolvedNumber = resolveComponentData(
        item.number,
        locale,
        streamDocument,
      );
      const normalizedNumber =
        typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";
      const normalizedLabel = item.label?.trim() ?? "";

      if (!normalizedNumber) {
        return null;
      }

      return {
        label: normalizedLabel,
        originalNumber: normalizedNumber,
        formattedNumber: formatPhoneValue(
          normalizedNumber,
          props.data.info.phone.phoneFormat,
        ),
        telDigits: normalizedNumber.replace(/\D/g, ""),
        numberField: item.number,
      };
    })
    .filter(
      (
        item,
      ): item is {
        label: string;
        originalNumber: string;
        formattedNumber: string;
        telDigits: string;
        numberField: YextEntityField<string>;
      } => item !== null,
    );
  const resolvedHours = resolveComponentData(
    props.data.hours.hours,
    locale,
    streamDocument,
  );
  const additionalHoursText =
    typeof streamDocument.additionalHoursText === "string"
      ? streamDocument.additionalHoursText.trim()
      : "";
  const timeOptions: Intl.DateTimeFormatOptions =
    props.data.hours.hoursStyles.timeFormat === "24h"
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : { hour: "numeric", minute: "2-digit", hour12: true };
  const buttons = [props.data.info.primaryCta, props.data.info.secondaryCta];
  const offeringItems = detailsOfferingsSource
    .resolveItems(props.data.services.items, streamDocument)
    .map((item) => ({
      ...item,
      resolvedText: item.text
        ? resolveComponentData(item.text, locale, streamDocument, {
            output: "plainText",
          })
        : "",
      resolvedStatus: item.status
        ? resolveComponentData(item.status, locale, streamDocument, {
            output: "plainText",
          })
        : "check",
    }))
    .filter((item) => item.resolvedText.trim().length > 0);

  return (
    <AnalyticsScopeProvider
      name={`ModernRetailDetails${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{`
          .ps-details-shell .ps-detail-button:hover,
          .ps-details-shell .ps-detail-button:focus-visible {
            opacity: 0.88;
            transform: translateY(-1px);
          }
          .ps-hours-table {
            color: inherit;
            display: grid;
            font-size: 16px;
            font-weight: 400;
            gap: 12px;
            line-height: 1.5;
            width: 100%;
          }
          .ps-hours-table .HoursTable-row {
            align-items: baseline;
            display: grid;
            gap: 16px;
            grid-template-columns: max-content 1fr;
          }
          .ps-hours-table .HoursTable-day {
            color: inherit;
            text-transform: capitalize;
          }
          .ps-hours-table .HoursTable-intervals {
            justify-self: end;
            text-align: right;
          }
          @media (max-width: 1024px) {
            .ps-details-grid {
              grid-template-columns: 1fr 1fr !important;
            }
            .ps-details-grid .ps-services-card {
              grid-column: 1 / -1;
            }
          }
          @media (max-width: 749px) {
            .ps-details-grid {
              grid-template-columns: 1fr !important;
            }
            .ps-details-actions {
              align-items: stretch !important;
              display: grid !important;
            }
            .ps-details-actions a,
            .ps-details-actions button {
              width: 100%;
            }
          }
        `}</style>
        <section
          className="ps-details-shell"
          id="modern-retail-location-details"
          style={{
            backgroundColor: resolveThemeColorCssValue(
              props.section.backgroundColor,
            ),
            color: headingColor,
            padding: "48px 0",
          }}
        >
          <div
            style={{ margin: "0 auto", maxWidth: "1200px", padding: "0 16px" }}
          >
            <EntityField
              displayName="Section Heading"
              fieldId={props.data.sectionHeading.field}
              constantValueEnabled={
                props.data.sectionHeading.constantValueEnabled
              }
            >
              <h2
                style={{
                  ...getSharedTextStyle(
                    props.styles.sectionHeading.styles,
                    props.styles.sectionHeading.fontColor,
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
            <div
              className="ps-details-grid"
              style={{
                display: "grid",
                gap: "16px",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              }}
            >
              <article
                className="border border-current/10"
                style={{
                  backgroundColor: cardBackgroundColor,
                  color: cardForeground,
                  display: "grid",
                  gap: "24px",
                  padding: "24px",
                }}
              >
                <EntityField
                  displayName="Info Heading"
                  fieldId={props.data.info.heading.field}
                  constantValueEnabled={
                    props.data.info.heading.constantValueEnabled
                  }
                >
                  <h3
                    style={{
                      ...getSharedTextStyle(
                        props.styles.heading.styles,
                        props.styles.heading.fontColor,
                      ),
                      lineHeight: 1.12,
                      margin: 0,
                    }}
                  >
                    {resolvedInfoHeading}
                  </h3>
                </EntityField>
                <div style={{ display: "grid", gap: "20px" }}>
                  <div style={{ display: "grid", gap: "8px" }}>
                    <EntityField
                      displayName="Address Subheading"
                      fieldId={props.data.info.address.subheading.field}
                      constantValueEnabled={
                        props.data.info.address.subheading.constantValueEnabled
                      }
                    >
                      <h4
                        style={{
                          color: resolveThemeColorCssValue(
                            props.styles.address.subheadingFontColor,
                          ),
                          fontSize: "16px",
                          fontWeight: 600,
                          lineHeight: 1.2,
                          margin: 0,
                        }}
                      >
                        {resolvedAddressSubheading}
                      </h4>
                    </EntityField>
                    {resolvedAddress ? (
                      <EntityField
                        displayName="Address"
                        fieldId={props.data.info.address.address.field}
                        constantValueEnabled={
                          props.data.info.address.address.constantValueEnabled
                        }
                      >
                        <div
                          style={{
                            color: resolveThemeColorCssValue(
                              props.styles.address.contentFontColor,
                            ),
                            fontSize: "16px",
                            fontWeight: 400,
                            lineHeight: 1.5,
                            margin: 0,
                          }}
                        >
                          <Address
                            address={resolvedAddress}
                            lines={[
                              ["line1"],
                              ["city", ",", "region", "postalCode"],
                            ]}
                            showCountry={props.data.info.address.showCountry}
                            showRegion={props.data.info.address.showRegion}
                          />
                        </div>
                      </EntityField>
                    ) : null}
                  </div>
                  <div style={{ display: "grid", gap: "8px" }}>
                    <EntityField
                      displayName="Phone Subheading"
                      fieldId={props.data.info.phone.subheading.field}
                      constantValueEnabled={
                        props.data.info.phone.subheading.constantValueEnabled
                      }
                    >
                      <h4
                        style={{
                          color: resolveThemeColorCssValue(
                            props.styles.phone.subheadingFontColor,
                          ),
                          fontSize: "16px",
                          fontWeight: 600,
                          lineHeight: 1.2,
                          margin: 0,
                        }}
                      >
                        {resolvedPhoneSubheading}
                      </h4>
                    </EntityField>
                    {resolvedPhoneItems.length > 0 ? (
                      <div
                        style={{
                          color: resolveThemeColorCssValue(
                            props.styles.phone.contentFontColor,
                          ),
                          display: "grid",
                          fontSize: "16px",
                          gap: "8px",
                          lineHeight: 1.5,
                        }}
                      >
                        {resolvedPhoneItems.map((item) => {
                          const content = item.label
                            ? `${item.label} ${item.formattedNumber}`
                            : item.formattedNumber;

                          return (
                            <EntityField
                              key={`${item.label}-${item.originalNumber}`}
                              displayName="Phone Number"
                              fieldId={item.numberField.field}
                              constantValueEnabled={
                                item.numberField.constantValueEnabled
                              }
                            >
                              {!props.data.info.phone.includeHyperlink ||
                              !item.telDigits ? (
                                <div>{content}</div>
                              ) : (
                                <Link
                                  cta={{
                                    link: item.telDigits,
                                    linkType: "PHONE",
                                  }}
                                  style={{
                                    textDecoration: "none",
                                  }}
                                >
                                  {content}
                                </Link>
                              )}
                            </EntityField>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div
                  className="ps-details-actions"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                    paddingTop: "8px",
                  }}
                >
                  {buttons.map((cta, index) => {
                    const ctaValue: Partial<ComprehensiveCTAValue> = {
                      data: cta.data,
                      styles: cta.styles,
                      className: cta.className,
                      eventName: cta.eventName,
                    };

                    return (
                      <span
                        className="ps-detail-button"
                        key={`detail-cta-${index}`}
                      >
                        <EntityField
                          displayName={
                            index === 0
                              ? "Primary Call to Action"
                              : "Secondary Call to Action"
                          }
                          fieldId={cta.data.cta.field}
                          constantValueEnabled={
                            cta.data.cta.constantValueEnabled
                          }
                        >
                          <ComprehensiveCTA
                            value={ctaValue}
                            eventName={
                              index === 0 ? "websiteCta" : "getDirections"
                            }
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
                              flex: "0 0 auto",
                              justifyContent: "center",
                              minHeight: "44px",
                              padding: "10px 24px",
                              textDecoration: "none",
                              transition:
                                "transform 180ms ease, opacity 180ms ease",
                              whiteSpace: "nowrap",
                              width: "fit-content",
                            }}
                          />
                        </EntityField>
                      </span>
                    );
                  })}
                </div>
              </article>
              <article
                className="border border-current/10"
                style={{
                  backgroundColor: cardBackgroundColor,
                  color: cardForeground,
                  display: "grid",
                  gap: "24px",
                  padding: "24px",
                }}
              >
                <EntityField
                  displayName="Hours Heading"
                  fieldId={props.data.hours.heading.field}
                  constantValueEnabled={
                    props.data.hours.heading.constantValueEnabled
                  }
                >
                  <h3
                    style={{
                      ...getSharedTextStyle(
                        props.styles.heading.styles,
                        props.styles.heading.fontColor,
                      ),
                      lineHeight: 1.12,
                      margin: 0,
                    }}
                  >
                    {resolvedHoursHeading}
                  </h3>
                </EntityField>
                {resolvedHours ? (
                  <EntityField
                    displayName="Hours"
                    fieldId={props.data.hours.hours.field}
                    constantValueEnabled={
                      props.data.hours.hours.constantValueEnabled
                    }
                  >
                    <div
                      style={{
                        alignItems:
                          props.data.hours.hoursStyles.alignment ===
                          "items-center"
                            ? "center"
                            : props.data.hours.hoursStyles.alignment ===
                                "items-end"
                              ? "flex-end"
                              : "flex-start",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {props.data.hours.hoursStyles.showCurrentStatus ? (
                        <HoursStatus
                          hours={resolvedHours}
                          comingSoon={streamDocument.comingSoon}
                          timezone={streamDocument.timezone ?? "UTC"}
                          dayOptions={{
                            weekday:
                              props.data.hours.hoursStyles.dayOfWeekFormat,
                          }}
                          timeOptions={{
                            hour12:
                              props.data.hours.hoursStyles.timeFormat === "12h",
                          }}
                          statusTemplate={(params: StatusParams) => {
                            const isOpen24h =
                              params.currentInterval?.is24h?.() || false;
                            const isIndefinitelyClosed = !params.futureInterval;

                            const currentContent = streamDocument.comingSoon ? (
                              <span className="HoursStatus-current">
                                Coming Soon
                              </span>
                            ) : isOpen24h ? (
                              <span className="HoursStatus-current">
                                Open 24 Hours
                              </span>
                            ) : isIndefinitelyClosed ? (
                              <span className="HoursStatus-current">
                                Temporarily Closed
                              </span>
                            ) : (
                              <span className="HoursStatus-current">
                                {params.isOpen ? "Open Now" : "Closed"}
                              </span>
                            );

                            if (
                              streamDocument.comingSoon ||
                              isOpen24h ||
                              isIndefinitelyClosed
                            ) {
                              return <div>{currentContent}</div>;
                            }

                            const interval = params.isOpen
                              ? params.currentInterval
                              : params.futureInterval;
                            const time = params.isOpen
                              ? (interval?.getEndTime(
                                  locale,
                                  params.timeOptions,
                                ) ?? "")
                              : (interval?.getStartTime(
                                  locale,
                                  params.timeOptions,
                                ) ?? "");
                            const showDayOfWeek =
                              props.data.hours.hoursStyles.showDayNames &&
                              Boolean(interval);
                            const dayOfWeek = showDayOfWeek
                              ? params.isOpen
                                ? (interval?.end
                                    ?.setLocale(locale)
                                    .toLocaleString(params.dayOptions) ?? "")
                                : (interval?.start
                                    ?.setLocale(locale)
                                    .toLocaleString(params.dayOptions) ?? "")
                              : "";
                            const futureText = params.isOpen
                              ? dayOfWeek
                                ? `Closes at ${time} ${dayOfWeek}`
                                : `Closes at ${time}`
                              : dayOfWeek
                                ? `Opens at ${time} ${dayOfWeek}`
                                : `Opens at ${time}`;

                            return (
                              <div>
                                {currentContent}
                                <span className="HoursStatus-separator">
                                  {" "}
                                  •{" "}
                                </span>
                                <span className="HoursStatus-future">
                                  {futureText}
                                </span>
                              </div>
                            );
                          }}
                        />
                      ) : null}
                      <HoursTable
                        className="ps-hours-table"
                        hours={resolvedHours}
                        comingSoon={streamDocument.comingSoon}
                        startOfWeek={props.data.hours.hoursStyles.startOfWeek}
                        collapseDays={props.data.hours.hoursStyles.collapseDays}
                        timeOptions={timeOptions}
                      />
                      {props.data.hours.hoursStyles.showAdditionalHoursText &&
                      additionalHoursText ? (
                        <span
                          style={{
                            fontSize: "16px",
                            lineHeight: 1.5,
                          }}
                        >
                          {additionalHoursText}
                        </span>
                      ) : null}
                    </div>
                  </EntityField>
                ) : null}
              </article>
              <article
                className="ps-services-card border border-current/10"
                style={{
                  backgroundColor: cardBackgroundColor,
                  color: cardForeground,
                  display: "grid",
                  gap: "24px",
                  padding: "24px",
                }}
              >
                <EntityField
                  displayName="Services Heading"
                  fieldId={props.data.services.heading.field}
                  constantValueEnabled={
                    props.data.services.heading.constantValueEnabled
                  }
                >
                  <h3
                    style={{
                      ...getSharedTextStyle(
                        props.styles.heading.styles,
                        props.styles.heading.fontColor,
                      ),
                      lineHeight: 1.12,
                      margin: 0,
                    }}
                  >
                    {resolvedServicesHeading}
                  </h3>
                </EntityField>
                <EntityField
                  displayName="Services"
                  fieldId={props.data.services.items.field}
                  constantValueEnabled={
                    props.data.services.items.constantValueEnabled
                  }
                >
                  <ul
                    style={{
                      display: "grid",
                      fontSize: "16px",
                      gap: "18px",
                      lineHeight: 1.5,
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {offeringItems.map((item, index) => (
                      <li
                        key={`${item.resolvedText}-${index}`}
                        style={{
                          alignItems: "center",
                          color: resolveThemeColorCssValue(
                            props.styles.services.fontColor,
                          ),
                          display: "flex",
                          gap: "12px",
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            alignItems: "center",
                            backgroundColor: "transparent",
                            borderRadius: "999px",
                            display: "inline-flex",
                            fontSize: "16px",
                            fontWeight: 700,
                            justifyContent: "center",
                            lineHeight: 1,
                            minWidth: "16px",
                          }}
                        >
                          {item.resolvedStatus === "x" ? "×" : "✓"}
                        </span>
                        <span>{item.resolvedText}</span>
                      </li>
                    ))}
                  </ul>
                </EntityField>
              </article>
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const ModernRetailDetails: YextComponentConfig<ModernRetailDetailsProps> =
  {
    label: "Details",
    fields: detailsFields,
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "palette-quaternary",
        },
        cardBackgroundColor: defaultCardBackgroundColor,
      },
      data: {
        sectionHeading: defaultDetailsHeading.text,
        info: {
          heading: defaultInfoHeading,
          address: defaultDetailsAddress,
          phone: defaultDetailsPhone,
          primaryCta: defaultPrimaryCta,
          secondaryCta: defaultSecondaryCta,
        },
        hours: {
          heading: defaultHoursHeading,
          hours: {
            field: "hours",
            constantValue: {},
            constantValueEnabled: false,
          },
          hoursStyles: {
            startOfWeek: "monday",
            collapseDays: false,
            showAdditionalHoursText: false,
            alignment: "items-end",
            showCurrentStatus: false,
            timeFormat: "12h",
            dayOfWeekFormat: "long",
            showDayNames: true,
          },
        },
        services: {
          heading: defaultServicesHeading,
          items: detailsOfferingsSource.defaultValue,
        },
      },
      styles: {
        sectionHeading: {
          styles: defaultDetailsHeading.styles,
          fontColor: defaultDetailsHeading.fontColor,
        },
        heading: {
          styles: defaultCardHeadingStyles.styles,
          fontColor: defaultCardHeadingStyles.fontColor,
        },
        address: {},
        phone: {},
        services: {},
      },
    },
    render: (props) => <ModernRetailDetailsComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "ModernRetailDetails",
  displayName: "Details",
  description: "Details",
  pageSetTypes: ["ENTITY"],
};
