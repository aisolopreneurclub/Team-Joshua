"use client"

import { useEffect, useRef } from "react"
import type { Socket } from "socket.io-client"
import { connectSocket, disconnectSocket } from "@/lib/socket"

export function useSocket(onConnect?: (socket: Socket) => void) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = connectSocket()
    socketRef.current = socket

    if (onConnect) {
      socket.on("connect", () => onConnect(socket))
    }

    return () => {
      disconnectSocket()
    }
  }, [onConnect])

  return socketRef
}
