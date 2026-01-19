import { NextResponse } from 'next/server'

// GET - Buscar dados do clima de Foz do Iguaçu
export async function GET() {
  try {
    // Usando OpenWeatherMap API (gratuita)
    const API_KEY = process.env.OPENWEATHER_API_KEY || 'demo_key'
    const CITY = 'Foz do Iguaçu,BR'
    
    // Buscar dados atuais e previsão de 7 dias
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=-25.5167&lon=-54.5856&exclude=minutely,hourly&appid=${API_KEY}&units=metric&lang=pt_br`
    )

    if (!response.ok) {
      // Se a API falhar, retornar dados mockados para demonstração
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
          { temp: { max: 30, min: 22 }, description: mockCurrentWeather.description, icon: mockCurrentWeather.icon }, // Hoje - consistente
          { temp: { max: 29, min: 21 }, description: 'Parcialmente nublado', icon: '02d' },
          { temp: { max: 27, min: 19 }, description: 'Chuvoso', icon: '10d' },
          { temp: { max: 26, min: 18 }, description: 'Nublado', icon: '04d' },
          { temp: { max: 28, min: 20 }, description: 'Ensolarado', icon: '01d' },
          { temp: { max: 31, min: 23 }, description: 'Ensolarado', icon: '01d' },
          { temp: { max: 29, min: 21 }, description: 'Parcialmente nublado', icon: '02d' }
        ]
      })
    }

    const data = await response.json()
    
    const currentWeather = {
      temp: Math.round(data.current.temp),
      feels_like: Math.round(data.current.feels_like),
      humidity: data.current.humidity,
      description: data.current.weather[0].description,
      icon: data.current.weather[0].icon
    }

    // Mapear a previsão dos próximos 7 dias, garantindo que o primeiro dia seja consistente com o clima atual
    const dailyForecast = data.daily.slice(0, 7).map((day: any, index: number) => {
      if (index === 0) {
        // Para o primeiro dia (hoje), usar dados consistentes com o clima atual
        return {
          temp: {
            max: Math.round(day.temp.max),
            min: Math.round(day.temp.min)
          },
          description: currentWeather.description, // Usar a mesma descrição do clima atual
          icon: currentWeather.icon // Usar o mesmo ícone do clima atual
        }
      }
      return {
        temp: {
          max: Math.round(day.temp.max),
          min: Math.round(day.temp.min)
        },
        description: day.weather[0].description,
        icon: day.weather[0].icon
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
        { temp: { max: 30, min: 22 }, description: mockCurrentWeather.description, icon: mockCurrentWeather.icon }, // Hoje - consistente com clima atual
        { temp: { max: 29, min: 21 }, description: 'Parcialmente nublado', icon: '02d' },
        { temp: { max: 27, min: 19 }, description: 'Chuvoso', icon: '10d' },
        { temp: { max: 26, min: 18 }, description: 'Nublado', icon: '04d' },
        { temp: { max: 28, min: 20 }, description: 'Ensolarado', icon: '01d' },
        { temp: { max: 31, min: 23 }, description: 'Ensolarado', icon: '01d' },
        { temp: { max: 29, min: 21 }, description: 'Parcialmente nublado', icon: '02d' }
      ]
    })
  }
}





