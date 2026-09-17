import type { StatusParams } from "@yext/pages-components";
import type { TFunction } from "i18next";
import * as React from "react";

type TranslatedHoursStatusProps = {
  params: StatusParams;
  t: TFunction;
  locale: string;
  showCurrentStatus?: boolean;
  showDayNames?: boolean;
};

export const renderTranslatedHoursStatus = ({
  params,
  t,
  locale,
  showCurrentStatus = true,
  showDayNames = true,
}: TranslatedHoursStatusProps): React.ReactNode => {
  const isComingSoon = Boolean(params.comingSoon);
  const isOpen24Hours = Boolean(params.currentInterval?.is24h?.());
  const isIndefinitelyClosed = !params.futureInterval;
  const hasFutureStatus = !isOpen24Hours && !isIndefinitelyClosed;
  const interval = params.isOpen
    ? params.currentInterval
    : params.futureInterval;
  const time = params.isOpen
    ? (interval?.getEndTime(locale, params.timeOptions) ?? "")
    : (interval?.getStartTime(locale, params.timeOptions) ?? "");
  const dayOfWeek =
    showDayNames && hasFutureStatus && interval
      ? params.isOpen
        ? (interval.end
            ?.setLocale(locale)
            .toLocaleString(params.dayOptions) ?? "")
        : (interval.start
            ?.setLocale(locale)
            .toLocaleString(params.dayOptions) ?? "")
      : "";

  const currentStatusText = isComingSoon
    ? t("comingSoon", "Coming Soon")
    : isOpen24Hours
      ? t("open24Hours", "Open 24 Hours")
      : isIndefinitelyClosed
        ? t("temporarilyClosed", "Temporarily Closed")
        : params.isOpen
          ? t("openNow", "Open Now")
          : t("closed", "Closed");

  const futureStatusText =
    !isComingSoon && hasFutureStatus && time
      ? params.isOpen
        ? dayOfWeek
          ? t("closesAtTimeOnDay", {
              time,
              dayOfWeek,
              defaultValue: "Closes at {{time}} {{dayOfWeek}}",
            })
          : t("closesAtTime", {
              time,
              defaultValue: "Closes at {{time}}",
            })
        : dayOfWeek
          ? t("opensAtTimeOnDay", {
              time,
              dayOfWeek,
              defaultValue: "Opens at {{time}} {{dayOfWeek}}",
            })
          : t("opensAtTime", {
              time,
              defaultValue: "Opens at {{time}}",
            })
      : "";

  return (
    <div className="HoursStatus">
      {(showCurrentStatus || isComingSoon) && (
        <span className="HoursStatus-current" style={{ fontWeight: "bolder" }}>
          {currentStatusText}
        </span>
      )}
      {showCurrentStatus && futureStatusText ? (
        <>
          <span className="HoursStatus-separator"> • </span>
          <span className="HoursStatus-future">{futureStatusText}</span>
        </>
      ) : null}
    </div>
  );
};
