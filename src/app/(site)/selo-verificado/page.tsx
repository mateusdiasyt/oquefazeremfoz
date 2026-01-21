'use client'

import { CheckCircle, Shield, Star, TrendingUp, Users, Award } from 'lucide-react'

export default function SeloVerificadoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src="/icons/verificado.png" 
              alt="Selo Verificado" 
              className="w-20 h-20 md:w-24 md:h-24 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.02em' }}>
            Selo Verificado
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Destaque sua empresa e ganhe a confiança dos visitantes de Foz do Iguaçu
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ letterSpacing: '-0.01em' }}>
            Benefícios do Selo Verificado
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-purple-50/50 hover:bg-purple-50 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Autenticidade Confirmada</h3>
                <p className="text-sm text-gray-600">
                  Prove que sua empresa é real e está oficialmente cadastrada
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-pink-50/50 hover:bg-pink-50 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Maior Confiança</h3>
                <p className="text-sm text-gray-600">
                  Aumente a credibilidade e confiança dos seus clientes
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Maior Visibilidade</h3>
                <p className="text-sm text-gray-600">
                  Destaque-se nas buscas e apareça primeiro nos resultados
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50/50 hover:bg-green-50 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Diferencial Competitivo</h3>
                <p className="text-sm text-gray-600">
                  Seja reconhecido como uma empresa oficial e confiável
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ letterSpacing: '-0.01em' }}>
            Requisitos para Obter o Selo
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p className="text-gray-700">
                Ter uma empresa cadastrada e aprovada na plataforma
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p className="text-gray-700">
                Possuir documentação legal da empresa (CNPJ, alvará de funcionamento, etc.)
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p className="text-gray-700">
                Estar localizado em Foz do Iguaçu ou região
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <p className="text-gray-700">
                Ter perfil completo e atualizado na plataforma
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-xl p-8 md:p-12 text-center">
          <Award className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Obtenha Seu Selo Verificado Hoje
          </h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto text-lg">
            Entre em contato conosco pelo WhatsApp para iniciar o processo de verificação da sua empresa
          </p>
          
          <a
            href="https://wa.me/5545999287669?text=Olá!%20Gostaria%20de%20obter%20o%20selo%20verificado%20para%20minha%20empresa."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>Falar no WhatsApp</span>
          </a>
          
          <p className="text-purple-200 text-sm mt-6">
            Atendimento rápido e personalizado
          </p>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ letterSpacing: '-0.01em' }}>
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Quanto tempo leva para obter o selo?
              </h3>
              <p className="text-gray-600 text-sm">
                O processo de verificação geralmente leva de 2 a 5 dias úteis após o envio de toda a documentação necessária.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Há algum custo para obter o selo?
              </h3>
              <p className="text-gray-600 text-sm">
                Entre em contato conosco pelo WhatsApp para conhecer nossos planos e valores.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Preciso renovar o selo periodicamente?
              </h3>
              <p className="text-gray-600 text-sm">
                O selo verificado é válido enquanto sua empresa mantiver o perfil atualizado e ativo na plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
