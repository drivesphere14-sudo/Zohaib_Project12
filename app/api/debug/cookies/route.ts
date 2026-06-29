import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookies = request.cookies.getAll().map(c => ({ name: c.name, value: c.value, options: c.options }))
    return NextResponse.json({ cookies })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
