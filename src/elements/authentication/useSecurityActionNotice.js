"use client";

import { useEffect, useId } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { showNotification } from "@/redux/notification";

export default function useSecurityActionNotice(busy, message) {
  const id = useId();
  const dispatch = useDispatch();
  useEffect(() => {
    if (!busy) return;
    const toastId = `security-action-${id}`;
    dispatch(showNotification({ severity: "info", loading: true, detail: message, toastId, life: Infinity }));
    return () => toast.remove(toastId);
  }, [busy, message, id, dispatch]);
}
