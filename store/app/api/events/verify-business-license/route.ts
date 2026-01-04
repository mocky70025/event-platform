import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openaiApiKey = process.env.OPENAI_API_KEY

if (!openaiApiKey) {
  console.warn('OPENAI_API_KEY is not set. Business license verification will not work.')
}

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null

/**
 * 営業許可証の画像をAIで読み取り、期限を確認するAPI
 * 
 * @param imageUrl - 営業許可証の画像URL
 * @returns { isValid: boolean, result: 'yes' | 'no', expirationDate?: string, error?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      )
    }

    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API is not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    // 画像をBase64に変換するために、画像URLから画像を取得
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from URL')
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const imageBase64 = Buffer.from(imageBuffer).toString('base64')
    const imageMimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // OpenAI APIを使用して画像を読み取り
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // gpt-4.1miniは存在しないため、gpt-4o-miniを使用
      messages: [
        {
          role: 'system',
          content: `あなたは営業許可証を読み取る専門家です。画像から営業許可証の有効期限を確認してください。
以下のルールに従って回答してください：
1. 画像から有効期限（満了日、有効期限日など）を探してください
2. 有効期限が今日の日付より後であれば "yes"、今日の日付より前であれば "no" を返してください
3. 有効期限が見つからない場合は "no" を返してください
4. 有効期限の日付も一緒に返してください（YYYY-MM-DD形式）

回答は以下のJSON形式で返してください：
{
  "isValid": true or false,
  "expirationDate": "YYYY-MM-DD" or null,
  "reason": "期限の説明"
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'この営業許可証の有効期限を確認してください。今日の日付は ' + new Date().toISOString().split('T')[0] + ' です。'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageMimeType};base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from OpenAI')
    }

    // JSONレスポンスをパース
    let parsedResponse
    try {
      // JSONコードブロックを削除
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        parsedResponse = JSON.parse(responseContent)
      }

      // レスポンス形式を調整
      return NextResponse.json({
        result: parsedResponse.isValid ? 'yes' : 'no',
        expirationDate: parsedResponse.expirationDate,
        reason: parsedResponse.reason || (parsedResponse.isValid ? '有効期限内です' : '有効期限切れか、確認できませんでした')
      })
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e)
      return NextResponse.json({
        result: 'no',
        expirationDate: null,
        reason: 'AIの応答を解析できませんでした'
      })
    }
  } catch (error: any) {
    console.error('Business license verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
