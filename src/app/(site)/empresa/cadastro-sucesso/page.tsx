'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Clock, Home } from 'lucide-react'
import Link from 'next/link'

function EmpresaCadastroSucessoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const businessName = searchParams.get('nome') || 'sua empresa'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
          {/* Ícone de sucesso */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.02em' }}>
            Empresa Cadastrada com Sucesso!
          </h1>

          {/* Mensagem principal */}
          <div className="mb-8">
            <p className="text-lg text-gray-600 mb-6">
              Parabéns! <strong>{businessName}</strong> foi cadastrada com sucesso.
            </p>
            
            {/* Card de status */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-semibold text-amber-900">
                  Aguardando Aprovação da Administração
                </h2>
              </div>
              <p className="text-amber-800 text-sm leading-relaxed">
                Sua empresa foi enviada para análise. Em breve, nossa equipe revisará o cadastro e você receberá uma notificação quando for aprovada. 
                Após a aprovação, você poderá publicar posts, adicionar produtos, criar cupons e interagir com outros usuários.
              </p>
            </div>

            {/* O que acontece agora */}
            <div className="text-left bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">O que acontece agora?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Sua empresa está em análise pela nossa equipe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Você receberá uma notificação quando aprovada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span>Enquanto isso, você pode gerenciar suas empresas e visualizar informações</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/minhas-empresas"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-md shadow-purple-500/20"
            >
              Ver Minhas Empresas
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Ir para Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EmpresaCadastroSucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <EmpresaCadastroSucessoContent />
    </Suspense>
  )
}
