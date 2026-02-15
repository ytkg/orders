import { describe, expect, test } from "vitest";
import {
  VISITORS_COOKIE_KEY,
  readVisitorsFromCookie,
  writeVisitorsToCookie
} from "./visitorCookieStorage";

function createCookieDocument(cookie = ""): Document {
  return { cookie } as Document;
}

describe("visitorCookieStorage", () => {
  test("cookie がない場合は空配列", () => {
    const doc = createCookieDocument();
    expect(readVisitorsFromCookie(doc)).toEqual([]);
  });

  test("v1形式を読み取れる", () => {
    const payload = encodeURIComponent(
      JSON.stringify({
        version: 1,
        visitors: [
          { id: "visitor-1", name: "A卓" },
          { id: "visitor-2", name: "B卓" }
        ]
      })
    );

    const doc = createCookieDocument(`${VISITORS_COOKIE_KEY}=${payload}`);

    expect(readVisitorsFromCookie(doc)).toEqual([
      { id: "visitor-1", name: "A卓" },
      { id: "visitor-2", name: "B卓" }
    ]);
  });

  test("legacy配列形式も読み取れる", () => {
    const payload = encodeURIComponent(
      JSON.stringify([
        { id: "visitor-1", name: "A卓" },
        { id: "visitor-2", name: "B卓" }
      ])
    );

    const doc = createCookieDocument(`${VISITORS_COOKIE_KEY}=${payload}`);

    expect(readVisitorsFromCookie(doc)).toEqual([
      { id: "visitor-1", name: "A卓" },
      { id: "visitor-2", name: "B卓" }
    ]);
  });

  test("壊れたJSONは空配列", () => {
    const doc = createCookieDocument(`${VISITORS_COOKIE_KEY}=invalid-json`);
    expect(readVisitorsFromCookie(doc)).toEqual([]);
  });

  test("不正要素は除外する", () => {
    const payload = encodeURIComponent(
      JSON.stringify({
        version: 1,
        visitors: [
          { id: "visitor-1", name: "A卓" },
          { id: "", name: "B卓" },
          { id: "visitor-1", name: "重複ID" },
          { id: "visitor-3", name: "   " }
        ]
      })
    );

    const doc = createCookieDocument(`${VISITORS_COOKIE_KEY}=${payload}`);

    expect(readVisitorsFromCookie(doc)).toEqual([{ id: "visitor-1", name: "A卓" }]);
  });

  test("write はversion付きで保存する", () => {
    const doc = createCookieDocument();

    writeVisitorsToCookie(
      [
        { id: "visitor-1", name: "A卓" },
        { id: "visitor-2", name: "B卓" }
      ],
      doc
    );

    const encoded = doc.cookie
      .split("; ")[0]
      .split("=")[1];

    expect(encoded).toBeTruthy();
    expect(readVisitorsFromCookie(doc)).toEqual([
      { id: "visitor-1", name: "A卓" },
      { id: "visitor-2", name: "B卓" }
    ]);
  });
});
