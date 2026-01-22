import { NextResponse } from 'next/server'

// Coordenadas de Foz do Iguaçu
const LAT = -25.5167
const LON = -54.5856

// Função para mapear código do OpenWeather para descrição em português
function getWeatherDescription(weatherCode: number): string {
  const descriptions: { [key: number]: string } = {
    0: 'Céu limpo',
    1: 'Principalmente limpo',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Nevoeiro',
    48: 'Nevoeiro com geada',
    51: 'Chuva leve',
    53: 'Chuva moderada',
    55: 'Chuva forte',
    61: 'Chuva leve',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    71: 'Neve leve',
    73: 'Neve moderada',
    75: 'Neve forte',
    80: 'Chuva leve',
    81: 'Chuva moderada',
    82: 'Chuva forte',
    85: 'Nevasca leve',
    86: 'Nevasca forte',
    95: 'Tempestade',
    96: 'Tempestade com granizo',
    99: 'Tempestade severa com granizo'
  }
  return descriptions[weatherCode] || 'Condições variáveis'
}

// Função para mapear código do OpenWeather para ícone
function getWeatherIcon(weatherCode: number, isDay: boolean = true): string {
  const iconMap: { [key: number]: string } = {
    0: isDay ? '01d' : '01n', // Céu limpo
    1: isDay ? '02d' : '02n', // Principalmente limpo
    2: isDay ? '02d' : '02n', // Parcialmente nublado
    3: '04d', // Nublado
    45: '50d', // Nevoeiro
    48: '50d', // Nevoeiro com geada
    51: '09d', // Chuva leve
    53: '09d', // Chuva moderada
    55: '09d', // Chuva forte
    61: '10d', // Chuva leve
    63: '10d', // Chuva moderada
    65: '10d', // Chuva forte
    71: '13d', // Neve leve
    73: '13d', // Neve moderada
    75: '13d', // Neve forte
    80: '09d', // Chuva leve
    81: '09d', // Chuva moderada
    82: '09d', // Chuva forte
    85: '13d', // Nevasca leve
    86: '13d', // Nevasca forte
    95: '11d', // Tempestade
    96: '11d', // Tempestade com granizo
    99: '11d' // Tempestade severa com granizo
  }
  return iconMap[weatherCode] || '02d'
}

// GET - Buscar dados do clima de Foz do Iguaçu usando Open-Meteo (gratuito e sem API key)
export async function GET() {
  try {
    // Open-Meteo é gratuito, confiável e não precisa de API key
    // Buscar dados atuais e previsão de 7 dias
    const currentUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=America/Sao_Paulo&forecast_days=7`
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=America/Sao_Paulo&forecast_days=7`

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ])

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Erro ao buscar dados do clima')
    }

    const currentData = await currentResponse.json()
    const forecastData = await forecastResponse.json()

    const current = currentData.current
    const daily = forecastData.daily

    // Temperatura atual
    const currentTemp = Math.round(current.temperature_2m)
    
    // Calcular sensação térmica aproximada (baseado na temperatura e umidade)
    const humidity = current.relative_humidity_2m
    const feelsLike = Math.round(currentTemp + (humidity > 70 ? 3 : humidity > 50 ? 2 : 1))

    const currentWeatherCode = current.weather_code
    const currentDescription = getWeatherDescription(currentWeatherCode)
    const currentIcon = getWeatherIcon(currentWeatherCode, true)

    const currentWeather = {
      temp: currentTemp,
      feels_like: feelsLike,
      humidity: humidity,
      description: currentDescription,
      icon: currentIcon
    }

    // Mapear previsão dos próximos 7 dias
    const dailyForecast = daily.time.slice(0, 7).map((date: string, index: number) => {
      const maxTemp = Math.round(daily.temperature_2m_max[index])
      const minTemp = Math.round(daily.temperature_2m_min[index])
      const weatherCode = daily.weather_code[index]
      const description = getWeatherDescription(weatherCode)
      const icon = getWeatherIcon(weatherCode, true)

      return {
        temp: {
          max: maxTemp,
          min: minTemp
        },
        description: description,
        icon: icon
      }
    })

    return NextResponse.json({
      current: currentWeather,
      daily: dailyForecast
    })

  } catch (error) {
    console.error('Erro ao buscar dados do clima:', error)
    
    // Retornar dados mockados em caso de erro
    const mockCurrentWeather = {
      temp: 28,
      feels_like: 32,
      humidity: 65,
      description: 'Parcialmente nublado',
      icon: '02d'
    }

    return NextResponse.json({
      current: mockCurrentWeather,
      daily: [
        { temp: { max: 30, min: 22 }, description: mockCurrentWeather.description, icon: mockCurrentWeather.icon },
        { temp: { max: 29, min: 21 }, description: 'Parcialmente nublado', icon: '02d' },
        { temp: { max: 27, min: 19 }, description: 'Chuvoso', icon: '10d' },
        { temp: { max: 26, min: 18 }, description: 'Nublado', icon: '04d' },
        { temp: { max: 28, min: 20 }, description: 'Ensolarado', icon: '01d' },
        { temp: { max: 31, min: 23 }, description: 'Ensolarado', icon: '01d' },
        { temp: { max: 29, min: 21 }, description: 'Parcialmente nublado', icon: '02d' }
      ]
    }, { status: 200 }) // Retornar 200 mesmo em caso de erro para não quebrar a UI
  }
}





