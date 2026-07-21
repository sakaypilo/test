import { useState, useEffect, useCallback } from 'react'
import { getApiErrorMessage } from '../services/api'

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
      setError(getApiErrorMessage(err))
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

  // useCallback stabilise la référence pour éviter des re-renders infinis
  const fetchData = useCallback(async (newParams: any = {}) => {
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
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFunction])

  const refresh = useCallback(() => fetchData(), [fetchData])
  const updateParams = useCallback((newParams: any) => fetchData(newParams), [fetchData])

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