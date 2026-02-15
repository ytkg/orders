import { FormEvent, useEffect, useState } from "react";
import { generateId } from "../../../shared/utils/id";
import type { Visitor } from "../model/types";
import {
  readVisitorsFromCookie,
  writeVisitorsToCookie
} from "../storage/visitorCookieStorage";

type UseVisitorRegistryOptions = {
  onVisitorRemoved?: (visitorName: string) => void;
};

export function useVisitorRegistry(options?: UseVisitorRegistryOptions) {
  const [visitors, setVisitors] = useState<Visitor[]>(() => readVisitorsFromCookie());
  const [newVisitorName, setNewVisitorName] = useState("");
  const [visitorError, setVisitorError] = useState("");

  const addVisitor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = newVisitorName.trim();

    if (!normalized) {
      setVisitorError("来店者名を入力してください。");
      return;
    }

    if (visitors.some((visitor) => visitor.name === normalized)) {
      setVisitorError("同じ来店者名は登録できません。");
      return;
    }

    setVisitors((prev) => [
      ...prev,
      {
        id: generateId("visitor"),
        name: normalized
      }
    ]);
    setNewVisitorName("");
    setVisitorError("");
  };

  const removeVisitor = (id: string) => {
    const removedVisitor = visitors.find((visitor) => visitor.id === id);
    setVisitors((prev) => prev.filter((visitor) => visitor.id !== id));

    if (!removedVisitor) {
      return;
    }

    options?.onVisitorRemoved?.(removedVisitor.name);
  };

  useEffect(() => {
    writeVisitorsToCookie(visitors);
  }, [visitors]);

  return {
    visitors,
    newVisitorName,
    visitorError,
    setNewVisitorName,
    addVisitor,
    removeVisitor
  };
}
