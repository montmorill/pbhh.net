#!/usr/bin/env bun
/**
 * NapCatQQ 事件连接器
 *
 * 运行方式：bun run bot/connector.ts
 *
 * 环境变量：
 *   SERVER_URL    服务器 WebSocket 地址，例如 ws://your-server.com/api/events/ws
 *   BOT_SECRET    与服务器 BOT_SECRET 一致
 *   NAPCAT_URL    NapCatQQ HTTP API 地址，例如 http://localhost:3001
 *   QQ_GROUP_ID   要推送消息的 QQ 群号
 */

const SERVER_URL = Bun.env.SERVER_URL ?? 'ws://localhost:3000/api/events/ws'
const BOT_SECRET = Bun.env.BOT_SECRET ?? ''
const NAPCAT_URL = Bun.env.NAPCAT_URL ?? 'http://localhost:3001'
const QQ_GROUP_ID = Bun.env.QQ_GROUP_ID ?? ''

// 订阅的 topic，"*" 表示全部，"user.*" 表示所有用户事件
const TOPICS = ['user.*', 'content.*']

function connect() {
  const ws = new WebSocket(`${SERVER_URL}?token=${BOT_SECRET}`)

  ws.addEventListener('open', () => {
    console.log('[connector] 已连接到服务器')
    ws.send(JSON.stringify({ type: 'subscribe', topics: TOPICS }))
  })

  ws.addEventListener('message', async (e) => {
    let msg: unknown
    try { msg = JSON.parse(e.data as string) }
    catch { return }

    if (typeof msg !== 'object' || msg === null) return
    const m = msg as Record<string, unknown>

    if (m.type === 'ack') {
      console.log('[connector] 订阅成功：', m.topics)
    }
    else if (m.type === 'event') {
      await handleEvent(m.topic as string, m.payload)
    }
  })

  ws.addEventListener('close', (e) => {
    console.warn(`[connector] 断开连接 (code ${e.code})，5秒后重连…`)
    setTimeout(connect, 5000)
  })

  ws.addEventListener('error', () => {
    // close 事件会随后触发并自动重连
  })
}

async function handleEvent(topic: string, payload: unknown) {
  console.log(`[event] ${topic}`, payload)

  if (topic === 'user.registered') {
    const p = payload as { username: string }
    await sendGroupMsg(`新用户注册：${p.username}`)
  }
  else if (topic.startsWith('content.')) {
    const p = payload as Record<string, unknown>
    await sendGroupMsg(`内容更新 [${topic}]：${p.title ?? JSON.stringify(payload)}`)
  }
}

async function sendGroupMsg(text: string) {
  if (!QQ_GROUP_ID) {
    console.warn('[napcat] 未设置 QQ_GROUP_ID，跳过发送')
    return
  }
  try {
    const res = await fetch(`${NAPCAT_URL}/send_group_msg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: Number(QQ_GROUP_ID),
        message: [{ type: 'text', data: { text } }],
      }),
    })
    if (!res.ok)
      console.error('[napcat] 发送失败：', await res.text())
  }
  catch (err) {
    console.error('[napcat] 请求错误：', err)
  }
}

connect()
