import { useState, useEffect } from 'react'

interface UseApiOptions {
  immediate?: boolean
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: any[]) => Promise<void>
  reset: () => void
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (...args: any[]) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFunction(...args)
      
      if (response.success) {
        setData(response.data || response)
      } else {
        setError(response.message || 'Une erreur est survenue')
      }
    } catch (err) {
      setError((err as Error).message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
    setLoading(false)
  }

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [])

  return { data, loading, error, execute, reset }
}

// Hook spécialisé pour les listes avec pagination
export function useApiList<T = any>(
  apiFunction: (params?: any) => Promise<any>,
  initialParams: any = {}
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)
  const [params, setParams] = useState(initialParams)

  const fetchData = async (newParams = {}) => {
    try {
      setLoading(true)
      setError(null)
      const mergedParams = { ...params, ...newParams }
      const response = await apiFunction(mergedParams)
      
      if (response.success) {
        setData(response.data || [])
        setPagination(response.pagination || null)
        setParams(mergedParams)
      } else {
        setError(response.message || 'Une erreur est survenue')
      }
    } catch (err) {
      setError((err as Error).message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => fetchData()
  const updateParams = (newParams: any) => fetchData(newParams)

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    error,
    pagination,
    params,
    fetchData,
    refresh,
    updateParams
  }
}