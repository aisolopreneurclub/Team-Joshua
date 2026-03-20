"use client"

import { useQuery } from "@tanstack/react-query"
import { useNotificationStore } from "@/stores/useNotificationStore"
import { apiFetch } from "@/lib/api-client"
import { useEffect } from "react"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export function useNotifications() {
  const { setNotifications, markAsRead, markAllAsRead } =
    useNotificationStore()

  const { data, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<Notification[]>("/api/v1/notifications"),
    enabled: false,
  })

  useEffect(() => {
    if (data) {
      setNotifications(data)
    }
  }, [data, setNotifications])

  return { refetch, markAsRead, markAllAsRead }
}
