import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, documentType } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: '画像URLが必要です' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API Keyが設定されていません' },
        { status: 500 }
      );
    }

    // 画像を取得してbase64に変換
    let base64Image: string;
    
    if (imageUrl.startsWith('data:')) {
      // データURLの場合（base64エンコード済み）
      const base64Match = imageUrl.match(/^data:image\/\w+;base64,(.+)$/);
      if (!base64Match) {
        return NextResponse.json(
          { error: '無効な画像データ形式です' },
          { status: 400 }
        );
      }
      base64Image = base64Match[1];
    } else {
      // URLの場合（Supabase Storageなど）
      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error('画像の取得に失敗しました');
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        base64Image = Buffer.from(imageBuffer).toString('base64');
      } catch (error: any) {
        return NextResponse.json(
          { error: '画像の取得に失敗しました', details: error.message },
          { status: 400 }
        );
      }
    }

    // ドキュメントタイプに応じたプロンプトを設定
    const prompts: Record<string, string> = {
      businessLicense: `この画像は営業許可証です。以下の情報を抽出してください：
- 許可証番号
- 事業者名
- 所在地
- 許可年月日
- 有効期限（あれば）
- その他の重要な情報

JSON形式で返してください。`,
      vehicleInspection: `この画像は車検証です。以下の情報を抽出してください：
- 車両番号（ナンバープレート）
- 車種
- 車検有効期限
- 所有者名
- その他の重要な情報

JSON形式で返してください。`,
      automobileInspection: `この画像は自賠責保険証です。以下の情報を抽出してください：
- 保険証券番号
- 車両番号
- 保険期間
- 保険会社名
- その他の重要な情報

JSON形式で返してください。`,
      plInsurance: `この画像はPL保険証です。以下の情報を抽出してください：
- 保険証券番号
- 保険期間
- 保険会社名
- 補償内容
- その他の重要な情報

JSON形式で返してください。`,
    };

    const prompt = prompts[documentType] || prompts.businessLicense;

    // OpenAI Vision APIを使用して画像を解析
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // または 'gpt-4-vision-preview'
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const recognizedText = response.choices[0]?.message?.content || '';

    // JSONをパース（レスポンスがJSON形式の場合）
    let parsedData;
    try {
      parsedData = JSON.parse(recognizedText);
    } catch {
      // JSONでない場合はテキストとして返す
      parsedData = { text: recognizedText };
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      rawText: recognizedText,
    });
  } catch (error: any) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      {
        error: '画像認識に失敗しました',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

