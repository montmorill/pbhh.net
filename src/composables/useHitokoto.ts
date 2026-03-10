import { ref } from 'vue'

interface Hitokoto {
  content: string
  fromWho: string | null
  from: string
}

export default function useHitokoto() {
  const hitokoto = ref<Hitokoto>()

  async function refresh() {
    const res = await fetch('https://v1.hitokoto.cn/')
    const data = await res.json()
    hitokoto.value = {
      content: data.hitokoto,
      fromWho: data.from_who,
      from: data.from,
    }
  }

  refresh()

  return { hitokoto, refresh }
}
