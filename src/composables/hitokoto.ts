import { ref } from 'vue'

interface Hitokoto {
  hitokoto: string
  fromWho: string | null
  from: string
}

export default function useHitokoto() {
  const hitokoto = ref<Hitokoto>()
  const fromLine = ref('')

  async function refresh() {
    const res = await fetch('https://v1.hitokoto.cn/')
    const data = await res.json()
    hitokoto.value = {
      hitokoto: data.hitokoto,
      fromWho: data.from_who,
      from: data.from,
    }
    fromLine.value = hitokoto.value.fromWho
      ? `${hitokoto.value.fromWho}「${hitokoto.value.from}」`
      : `「${hitokoto.value.from}」`
    fromLine.value = `——${fromLine.value}`
  }

  refresh()

  return { hitokoto, fromLine, refresh }
}
