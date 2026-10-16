import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getApplicationList,
  getPowerStatus,
  getVolumeInformation,
  loadBraviaConfig,
  saveBraviaConfig,
  sendIrcc,
  setActiveApp,
  setAudioMute,
  setAudioVolume,
  setTextForm,
  terminateApps,
  type BraviaConfig,
  type IrccCodeName,
} from "@/lib/bravia"

export function useBraviaConfig() {
  const [config, setConfig] = useState<BraviaConfig>(() => loadBraviaConfig())

  const update = (patch: Partial<BraviaConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch }
      saveBraviaConfig(next)
      return next
    })
  }

  return { config, update }
}

export function usePowerStatus(config: BraviaConfig) {
  return useQuery({
    queryKey: ["bravia", config.host, "power"],
    queryFn: () => getPowerStatus(config),
    refetchInterval: 15000,
    retry: 1,
  })
}

export function useVolumeInformation(config: BraviaConfig) {
  return useQuery({
    queryKey: ["bravia", config.host, "volume"],
    queryFn: () => getVolumeInformation(config),
    refetchInterval: 10000,
    retry: 1,
  })
}

export function useSendIrcc(config: BraviaConfig) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: IrccCodeName) => sendIrcc(name, config),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["bravia", config.host],
      })
    },
  })
}

export function useApplicationList(config: BraviaConfig) {
  return useQuery({
    queryKey: ["bravia", config.host, "apps"],
    queryFn: () => getApplicationList(config),
    staleTime: 60_000,
    retry: 1,
  })
}

export function useSetActiveApp(config: BraviaConfig) {
  return useMutation({
    mutationFn: (uri: string) => setActiveApp(config, uri),
  })
}

export function useTerminateApps(config: BraviaConfig) {
  return useMutation({
    mutationFn: () => terminateApps(config),
  })
}

export function useSetAudioVolume(config: BraviaConfig) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (volume: number) => setAudioVolume(config, volume),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["bravia", config.host, "volume"],
      })
    },
  })
}

export function useSetAudioMute(config: BraviaConfig) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (mute: boolean) => setAudioMute(config, mute),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["bravia", config.host, "volume"],
      })
    },
  })
}

export function useSetTextForm(config: BraviaConfig) {
  return useMutation({
    mutationFn: (text: string) => setTextForm(config, text),
  })
}
