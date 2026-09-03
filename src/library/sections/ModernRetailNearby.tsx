import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  EntityField,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getPreferredDistanceUnit,
  getThemeColorCssValue as resolveThemeColorCssValue,
  MapboxStaticMapComponent,
  mapboxStaticMapStyleOptions,
  mergeMeta,
  resolveComponentData,
  resolveUrlTemplate,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  useDocument,
  useNearbyLocations,
  useTemplateProps,
  VisibilityWrapper,
} from "@yext/visual-editor";

type SharedTextFieldValue = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type SharedStylesFieldValue = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type NearbyMapFieldValue = {
  coordinate: YextEntityField<{
    latitude: number;
    longitude: number;
  }>;
  mapStyle: string;
  height?: string;
  zoom?: number;
};

type NearbyProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  heading: SharedTextFieldValue;
  cardTitle: SharedStylesFieldValue;
  cardBody: SharedStylesFieldValue;
  button: {
    backgroundColor: ThemeColor;
    textColor: ThemeColor;
  };
  map: NearbyMapFieldValue;
};

type StreamDocumentShape = {
  name?: string;
  locale?: string;
  yextDisplayCoordinate?: {
    latitude?: number;
    longitude?: number;
  };
  _env?: {
    YEXT_MAPBOX_API_KEY?: string;
    YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY?: string;
  };
};

const resolveSurfaceForegroundColor = (
  surfaceColor?: ThemeColor,
): string | undefined =>
  resolveThemeColorCssValue(getDefaultForegroundColor(surfaceColor));

const defaultHeading: NearbyProps["heading"] = {
  text: {
    field: "",
    constantValue: {
      defaultValue: "Nearby",
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

const defaultCardBackgroundColor: ThemeColor = {
  selectedColor: "white",
  contrastingColor: "palette-quaternary",
};

const defaultCardTitle: NearbyProps["cardTitle"] = {
  styles: {
    fontFamily: "default",
    fontSize: "28px",
    fontWeight: "700",
    fontStyle: "default",
    textTransform: "none",
  },
};

const defaultCardBody: NearbyProps["cardBody"] = {
  styles: {
    fontFamily: "default",
    fontSize: "18px",
    fontWeight: "default",
    fontStyle: "default",
    textTransform: "default",
  },
};

const defaultButton: NearbyProps["button"] = {
  backgroundColor: {
    selectedColor: "white",
    contrastingColor: "palette-primary",
  },
  textColor: {
    selectedColor: "palette-primary",
    contrastingColor: "palette-primary-contrast",
  },
};

const defaultMap: NearbyProps["map"] = {
  coordinate: {
    field: "yextDisplayCoordinate",
    constantValue: {
      latitude: 0,
      longitude: 0,
    },
    constantValueEnabled: false,
  },
  mapStyle: "streets-v12",
  height: "100%",
  zoom: 11,
};

const defaultRadiusMiles = 10;
const defaultLimit = 3;

const nearbyFields: YextFields<NearbyProps> = {
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
  cardBody: {
    label: "Card Body",
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
  button: {
    label: "Button",
    type: "object",
    objectFields: {
      backgroundColor: {
        label: "Button Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      textColor: {
        label: "Label Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  map: {
    label: "Map",
    type: "object",
    objectFields: {
      coordinate: {
        type: "entityField",
        label: "Coordinates",
        filter: { types: ["type.coordinate"] },
      },
      mapStyle: {
        label: "Mapbox Map Style",
        type: "select",
        options: mapboxStaticMapStyleOptions,
      },
      zoom: {
        label: "Zoom",
        type: "number",
        min: 0,
        max: 22,
      },
    },
  },
};

const toText = (value: unknown) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  return "";
};

const formatPhone = (value: unknown) => toText(value);

const formatAddressLine2 = (address: Record<string, unknown> | undefined) => {
  if (!address) return "";
  const city = toText(address.city);
  const region = toText(address.region);
  const postalCode = toText(address.postalCode);
  return (
    [city, region].filter(Boolean).join(", ") +
    (postalCode ? ` ${postalCode}` : "")
  );
};

const getCoordinate = (locationData: Record<string, unknown>) => {
  const coordinateCandidate =
    (locationData.yextDisplayCoordinate as
      | Record<string, unknown>
      | undefined) ??
    (locationData.geocodedCoordinate as Record<string, unknown> | undefined);
  const latitude =
    typeof coordinateCandidate?.latitude === "number"
      ? coordinateCandidate.latitude
      : undefined;
  const longitude =
    typeof coordinateCandidate?.longitude === "number"
      ? coordinateCandidate.longitude
      : undefined;

  if (latitude == null || longitude == null) return null;
  return { latitude, longitude };
};

const haversineMiles = (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
) => {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const deltaLatitude = toRadians(destination.latitude - origin.latitude);
  const deltaLongitude = toRadians(destination.longitude - origin.longitude);
  const latitude1 = toRadians(origin.latitude);
  const latitude2 = toRadians(destination.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(deltaLongitude / 2) ** 2;

  return (
    2 *
    earthRadiusMiles *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
};

const formatDistanceLabel = (
  origin: { latitude: number; longitude: number } | undefined,
  locationData: Record<string, unknown>,
  locale: string,
) => {
  const destination = getCoordinate(locationData);
  if (!origin || !destination) return "";

  const unit = getPreferredDistanceUnit(locale);
  const miles = haversineMiles(origin, destination);
  const normalizedDistance = unit === "kilometer" ? miles * 1.609344 : miles;
  const roundedDistance = Math.round(normalizedDistance * 10) / 10;
  const unitLabel =
    unit === "kilometer"
      ? roundedDistance === 1
        ? "kilometer"
        : "kilometers"
      : roundedDistance === 1
        ? "mile"
        : "miles";

  return `Located ${roundedDistance.toFixed(1)} ${unitLabel} from this location`;
};

const buildDirectionsUrl = (locationData: Record<string, unknown>) => {
  const coordinate = getCoordinate(locationData);
  if (coordinate) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinate.latitude},${coordinate.longitude}`;
  }

  const address = locationData.address as Record<string, unknown> | undefined;
  const addressParts = [
    toText(address?.line1),
    toText(address?.city),
    toText(address?.region),
    toText(address?.postalCode),
  ].filter(Boolean);

  return addressParts.length > 0
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressParts.join(", "))}`
    : "#";
};

const NearbySectionShell = ({
  props,
  heading,
  map,
  button,
  locations,
  helperText,
  streamDocument,
}: {
  props: any;
  heading: string;
  map: NearbyMapFieldValue;
  button: NearbyProps["button"];
  locations: Array<{
    key: string;
    name: string;
    addressLine1: string;
    addressLine2: string;
    phone: string;
    distance: string;
    pageUrl: string;
    directionsUrl: string;
  }>;
  helperText?: string;
  streamDocument: StreamDocumentShape;
}) => {
  const sectionForeground = resolveSurfaceForegroundColor(props.section.backgroundColor);
  const cardForeground =
    resolveSurfaceForegroundColor(defaultCardBackgroundColor) ?? sectionForeground;
  const buttonColor = resolveThemeColorCssValue(button.textColor) ?? cardForeground;
  const buttonBackgroundColor = resolveThemeColorCssValue(button.backgroundColor);
  const iframe =
    typeof document === "undefined"
      ? null
      : (document.querySelector("iframe") as HTMLIFrameElement | null);
  let mapboxApiKey = streamDocument._env?.YEXT_MAPBOX_API_KEY;
  if (
    iframe?.contentDocument &&
    streamDocument._env?.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY
  ) {
    mapboxApiKey = streamDocument._env.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY;
  }

  return (
    <div className="nearby-stores">
      <EntityField
        displayName="Heading"
        fieldId={props.heading.text.field}
        constantValueEnabled={props.heading.text.constantValueEnabled}
      >
        <h2
          className="section-heading inline-richtext h2 heading-color text-uppercase heading-font nearby-stores__header"
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
            textAlign: "center",
            textTransform:
              props.heading.styles.textTransform === "default"
                ? undefined
                : props.heading.styles.textTransform,
          }}
        >
          {heading}
        </h2>
      </EntityField>
      <div
        className="nearby-stores__map-shell background-secondary"
        style={{
          backgroundColor: resolveThemeColorCssValue(defaultCardBackgroundColor),
          color: cardForeground,
          boxShadow: "0 16px 40px rgba(17,17,17,0.06)",
          overflow: "hidden",
        }}
      >
        <div className="nearby-stores__map-frame">
          <EntityField
            displayName="Map Coordinates"
            fieldId={map.coordinate.field}
            constantValueEnabled={map.coordinate.constantValueEnabled}
          >
            <MapboxStaticMapComponent
              id={`${props.id}-map`}
              coordinate={map.coordinate}
              mapStyle={map.mapStyle}
              height={map.height}
              zoom={map.zoom}
              puck={props.puck}
            />
          </EntityField>
        </div>
      </div>
      {helperText ? (
        <p
          style={{
            color: "currentColor",
            fontFamily: undefined,
            fontSize: "14px",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {helperText}
        </p>
      ) : null}
      {locations.length > 0 ? (
        <div
          className="ps-nearby-grid nearby-stores__grid"
          style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          }}
        >
          {locations.map((location, index) => (
            <article
              key={location.key}
              className="nearby-stores__card background-secondary"
              style={{
                backgroundColor: resolveThemeColorCssValue(defaultCardBackgroundColor),
                color: cardForeground,
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                minHeight: "100%",
              }}
            >
              <div className="nearby-stores__card-copy">
              <h3
                className="nearby-stores__card-title heading-font"
                style={{
                  color: resolveThemeColorCssValue(props.cardTitle.fontColor),
                  fontFamily:
                    props.cardTitle.styles.fontFamily === "default"
                      ? undefined
                      : props.cardTitle.styles.fontFamily,
                  fontSize:
                    props.cardTitle.styles.fontSize === "default"
                      ? undefined
                      : props.cardTitle.styles.fontSize,
                  fontStyle:
                    props.cardTitle.styles.fontStyle === "default"
                      ? undefined
                      : props.cardTitle.styles.fontStyle,
                  fontWeight:
                    props.cardTitle.styles.fontWeight === "default"
                      ? undefined
                      : props.cardTitle.styles.fontWeight,
                  margin: 0,
                  textTransform:
                    props.cardTitle.styles.textTransform === "default"
                      ? undefined
                      : props.cardTitle.styles.textTransform,
                }}
              >
                <Link
                  cta={{ link: location.pageUrl, linkType: "URL" }}
                  eventName={`nearbyPageLink${index}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {location.name}
                </Link>
              </h3>
              <div
                className="nearby-stores__meta"
                style={{
                  color: resolveThemeColorCssValue(props.cardBody.fontColor),
                  display: "grid",
                  fontFamily:
                    props.cardBody.styles.fontFamily === "default"
                      ? undefined
                      : props.cardBody.styles.fontFamily,
                  fontSize:
                    props.cardBody.styles.fontSize === "default"
                      ? undefined
                      : props.cardBody.styles.fontSize,
                  fontStyle:
                    props.cardBody.styles.fontStyle === "default"
                      ? undefined
                      : props.cardBody.styles.fontStyle,
                  fontWeight:
                    props.cardBody.styles.fontWeight === "default"
                      ? undefined
                      : props.cardBody.styles.fontWeight,
                  gap: "4px",
                  lineHeight: 1.45,
                  textTransform:
                    props.cardBody.styles.textTransform === "default"
                      ? undefined
                      : props.cardBody.styles.textTransform,
                }}
              >
                {location.addressLine1 ? (
                  <p style={{ margin: 0 }}>{location.addressLine1}</p>
                ) : null}
                {location.addressLine2 ? (
                  <p style={{ margin: 0 }}>{location.addressLine2}</p>
                ) : null}
              </div>
              {location.phone ? (
                <p
                  className="nearby-stores__phone"
                  style={{
                    color: resolveThemeColorCssValue(props.cardBody.fontColor),
                    fontFamily:
                      props.cardBody.styles.fontFamily === "default"
                        ? undefined
                        : props.cardBody.styles.fontFamily,
                    fontSize:
                      props.cardBody.styles.fontSize === "default"
                        ? undefined
                        : props.cardBody.styles.fontSize,
                    fontStyle:
                      props.cardBody.styles.fontStyle === "default"
                        ? undefined
                        : props.cardBody.styles.fontStyle,
                    fontWeight:
                      props.cardBody.styles.fontWeight === "default"
                        ? undefined
                        : props.cardBody.styles.fontWeight,
                    lineHeight: 1.45,
                    margin: 0,
                    textTransform:
                      props.cardBody.styles.textTransform === "default"
                        ? undefined
                        : props.cardBody.styles.textTransform,
                  }}
                >
                  {location.phone}
                </p>
              ) : null}
              {location.distance ? (
                <p
                  className="nearby-stores__distance"
                  style={{
                    color: resolveThemeColorCssValue(props.cardBody.fontColor),
                    fontFamily:
                      props.cardBody.styles.fontFamily === "default"
                        ? undefined
                        : props.cardBody.styles.fontFamily,
                    fontSize:
                      props.cardBody.styles.fontSize === "default"
                        ? undefined
                        : props.cardBody.styles.fontSize,
                    fontStyle:
                      props.cardBody.styles.fontStyle === "default"
                        ? undefined
                        : props.cardBody.styles.fontStyle,
                    fontWeight:
                      props.cardBody.styles.fontWeight === "default"
                        ? undefined
                        : props.cardBody.styles.fontWeight,
                    margin: 0,
                    textTransform:
                      props.cardBody.styles.textTransform === "default"
                        ? undefined
                        : props.cardBody.styles.textTransform,
                  }}
                >
                  {location.distance}
                </p>
              ) : null}
              </div>
              <Link
                cta={{ link: location.directionsUrl, linkType: "URL" }}
                eventName={`nearbyDirectionsCta${index}`}
                className="nearby-stores__link"
                style={{
                  alignSelf: "flex-start",
                  alignItems: "center",
                  backgroundColor: buttonBackgroundColor,
                  border: `1px solid ${buttonColor ?? "currentColor"}`,
                  color: buttonColor,
                  display: "inline-flex",
                  fontFamily: undefined,
                  fontSize: "13px",
                  fontWeight: 400,
                  justifyContent: "center",
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                  minHeight: "44px",
                  padding: "10px 24px",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  width: "fit-content",
                }}
              >
                Get Directions
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const ModernRetailNearbyComponent: PuckComponent<NearbyProps> = (props) => {
  const streamDocument =
    (useDocument() as StreamDocumentShape | undefined) ?? {};
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const locale = streamDocument.locale ?? "en";
  const heading =
    toText(resolveComponentData(props.heading.text, locale, streamDocument)) ||
    toText(props.heading.text.constantValue);
  const coordinate = streamDocument.yextDisplayCoordinate;
  const latitude = coordinate?.latitude;
  const longitude = coordinate?.longitude;
  const enabledNearbyLocations =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    defaultRadiusMiles > 0 &&
    defaultLimit > 0;

  const { data: nearbyLocationsData, status: nearbyLocationsStatus } =
    useNearbyLocations({
      streamDocument,
      latitude,
      longitude,
      radiusMi: defaultRadiusMiles,
      limit: defaultLimit,
      enabled: enabledNearbyLocations,
    });

  const nearbyLocationDocs = nearbyLocationsData?.response?.docs ?? [];
  const locations = nearbyLocationDocs
    .map((locationData, index) => {
      const record = locationData as Record<string, unknown>;
      const address = record.address as Record<string, unknown> | undefined;
      const mergedDocument = mergeMeta(record, streamDocument as any);
      const pageUrl = resolveUrlTemplate(
        mergedDocument,
        relativePrefixToRoot ?? "",
      );

      return {
        key: `${toText(record.id) || toText(record.name) || "nearby"}-${index}`,
        name: toText(record.name),
        addressLine1: toText(address?.line1),
        addressLine2: formatAddressLine2(address),
        phone: formatPhone(record.mainPhone),
        distance: formatDistanceLabel(
          latitude != null && longitude != null
            ? { latitude, longitude }
            : undefined,
          record,
          locale,
        ),
        pageUrl,
        directionsUrl: buildDirectionsUrl(record),
      };
    })
    .filter((location) => location.name.length > 0);

  const nearbyStyles = `
    .ps-nearby-layout {
      margin: 0 auto;
      max-width: 1200px;
      padding: 48px 16px;
    }
    .nearby-stores {
      display: grid;
      gap: 24px;
    }
    .nearby-stores__header {
      font-family: "Roboto", sans-serif;
      font-size: clamp(28px, 3.4vw, 44px);
      font-style: normal;
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1.08;
      text-transform: uppercase;
    }
    .nearby-stores__map-shell {
      padding: 24px;
      border: 1px solid currentColor;
      border-radius: 4px;
      box-shadow: 0 16px 40px rgba(17, 17, 17, 0.06);
    }
    .nearby-stores__map-frame {
      aspect-ratio: 2.8 / 1;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    .nearby-stores__map-frame .mapbox-static-map-shell,
    .nearby-stores__map-frame .mapbox-static-map-picture,
    .nearby-stores__map-frame .mapbox-static-map-image {
      height: 100%;
      width: 100%;
    }
    .nearby-stores__map-frame .mapbox-static-map-image {
      object-fit: cover;
      object-position: center;
    }
    .nearby-stores__card {
      border: 1px solid currentColor;
      border-radius: 4px;
      box-shadow: 0 16px 40px rgba(17, 17, 17, 0.06);
      padding: 32px;
    }
    .nearby-stores__card-copy {
      display: grid;
      gap: 18px;
    }
    .nearby-stores__card-title {
      color: inherit;
      font-family: "Roboto", sans-serif;
      font-size: 28px;
      font-style: normal;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 0.98;
      text-transform: none;
    }
    .nearby-stores__distance {
      color: inherit;
      font-size: 18px;
      line-height: 1.45;
    }
    .nearby-stores__link:hover,
    .nearby-stores__link:focus-visible {
      opacity: 0.88;
    }
    @media (max-width: 1024px) {
      .ps-nearby-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
      .ps-nearby-grid article:last-child {
        grid-column: 1 / -1;
      }
      .nearby-stores__card-title {
        font-size: 26px;
      }
    }
    @media (max-width: 749px) {
      .ps-nearby-grid {
        grid-template-columns: 1fr !important;
      }
      .ps-nearby-grid article:last-child {
        grid-column: auto;
      }
      .nearby-stores__map-shell {
        padding: 16px;
      }
      .nearby-stores__map-frame {
        aspect-ratio: 1.2 / 1;
      }
      .nearby-stores__card {
        padding: 24px;
      }
      .nearby-stores__card-title {
        font-size: 28px;
      }
      .nearby-stores__meta,
      .nearby-stores__meta p {
        font-size: 18px;
      }
      .nearby-stores__phone,
      .nearby-stores__distance {
        font-size: 17px;
      }
    }
  `;

  const renderShell = (helperText?: string, shellLocations = locations) => (
    <section
      id="theme-section-template--25351194706234__section_nearby_stores"
      className="theme-section"
      style={{
        backgroundColor: resolveThemeColorCssValue(props.section.backgroundColor),
        color: resolveSurfaceForegroundColor(props.section.backgroundColor),
      }}
    >
      <div className="ps-nearby-layout color-scheme-1">
        <NearbySectionShell
          props={props}
          heading={heading}
          map={props.map}
          button={props.button}
          locations={shellLocations}
          helperText={helperText}
          streamDocument={streamDocument}
        />
      </div>
    </section>
  );

  if (!enabledNearbyLocations) {
    if (!props.puck.isEditing) return <></>;
    return (
      <AnalyticsScopeProvider
        name={`ModernRetailNearby${getAnalyticsScopeHash(props.id)}`}
      >
        <VisibilityWrapper
          liveVisibility={props.section.visibleOnLivePage}
          isEditing={props.puck.isEditing}
        >
          <style>{nearbyStyles}</style>
          {renderShell("No nearby locations found for this location.")}
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    );
  }

  if (nearbyLocationsStatus === "pending") {
    return (
      <AnalyticsScopeProvider
        name={`ModernRetailNearby${getAnalyticsScopeHash(props.id)}`}
      >
        <VisibilityWrapper
          liveVisibility={props.section.visibleOnLivePage}
          isEditing={props.puck.isEditing}
        >
          <style>{nearbyStyles}</style>
          {renderShell("Loading nearby locations.")}
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    );
  }

  if (nearbyLocationsStatus !== "success" || !locations.length) {
    if (!props.puck.isEditing) {
      return <></>;
    }

    return (
      <AnalyticsScopeProvider
        name={`ModernRetailNearby${getAnalyticsScopeHash(props.id)}`}
      >
        <VisibilityWrapper
          liveVisibility={props.section.visibleOnLivePage}
          isEditing={props.puck.isEditing}
        >
          <style>{nearbyStyles}</style>
          {renderShell("No nearby locations found for this location.")}
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    );
  }

  return (
    <AnalyticsScopeProvider
      name={`ModernRetailNearby${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{nearbyStyles}</style>
        {renderShell(undefined, locations)}
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const ModernRetailNearby: YextComponentConfig<NearbyProps> = {
  label: "Nearby Locations",
  fields: nearbyFields,
  defaultProps: {
    section: {
      visibleOnLivePage: true,
      backgroundColor: {
        selectedColor: "white",
        contrastingColor: "palette-quaternary",
      },
    },
    heading: defaultHeading,
    cardTitle: defaultCardTitle,
    cardBody: defaultCardBody,
    button: defaultButton,
    map: defaultMap,
  },
  render: (props) => <ModernRetailNearbyComponent {...props} />,
};

export const config: SectionConfig = {
  id: "ModernRetailNearby",
  displayName: "Nearby Locations",
  description: "Nearby Locations",
  pageSetTypes: ["ENTITY"],
};
