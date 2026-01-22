import { prisma } from './db'

export type NotificationType = 'like_post' | 'like_comment' | 'follow' | 'comment'

interface CreateNotificationParams {
  businessId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

/**
 * Cria uma notificação para o dono da empresa
 */
export async function createNotification({
  businessId,
  type,
  title,
  message,
  link
}: CreateNotificationParams) {
  try {
    // Buscar o dono da empresa
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { userId: true }
    })

    if (!business) {
      console.error('Empresa não encontrada para criar notificação:', businessId)
      return null
    }

    // Criar notificação
    const notification = await prisma.notification.create({
      data: {
        id: `notification_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId: business.userId,
        businessId,
        type,
        title,
        message,
        link,
        isRead: false
      }
    })

    return notification
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return null
  }
}

/**
 * Cria notificação de like em post
 */
export async function notifyPostLike(postId: string, likerName: string, businessId: string) {
  // Buscar slug da empresa para criar o link correto
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { slug: true }
  })
  
  const businessSlug = business?.slug || businessId
  
  return createNotification({
    businessId,
    type: 'like_post',
    title: 'Nova curtida no seu post',
    message: `${likerName} curtiu seu post`,
    link: `/empresa/${businessSlug}`
  })
}

/**
 * Cria notificação de like em comentário
 */
export async function notifyCommentLike(commentId: string, likerName: string, businessId: string, postId: string) {
  // Buscar slug da empresa para criar o link correto
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { slug: true }
  })
  
  const businessSlug = business?.slug || businessId
  
  return createNotification({
    businessId,
    type: 'like_comment',
    title: 'Nova curtida no seu comentário',
    message: `${likerName} curtiu seu comentário`,
    link: `/empresa/${businessSlug}#comment-${commentId}`
  })
}

/**
 * Cria notificação de novo seguidor
 */
export async function notifyNewFollower(followerName: string, businessId: string) {
  // Buscar slug da empresa para criar o link correto
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { slug: true }
  })
  
  const businessSlug = business?.slug || businessId
  
  return createNotification({
    businessId,
    type: 'follow',
    title: 'Novo seguidor',
    message: `${followerName} começou a seguir sua empresa`,
    link: `/empresa/${businessSlug}`
  })
}

/**
 * Cria notificação de novo comentário
 */
export async function notifyNewComment(commentId: string, commenterName: string, businessId: string, postId: string) {
  // Buscar slug da empresa para criar o link correto
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { slug: true }
  })
  
  const businessSlug = business?.slug || businessId
  
  return createNotification({
    businessId,
    type: 'comment',
    title: 'Novo comentário no seu post',
    message: `${commenterName} comentou no seu post`,
    link: `/empresa/${businessSlug}#comment-${commentId}`
  })
}
