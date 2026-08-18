import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting manual migration for citations field...');
    
    // Check if citations column already exists by trying to query it
    try {
      await prisma.$queryRaw`SELECT citations FROM "Publication" LIMIT 1`;
      return NextResponse.json({
        success: true,
        message: "Citations column already exists",
        alreadyExists: true,
      });
    } catch (checkError: any) {
      console.log('Citations column does not exist, will add it now');
    }

    // Add the citations column
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Publication" 
        ADD COLUMN "citations" INTEGER DEFAULT 0
      `);
      console.log('✅ Citations column added successfully');
    } catch (addError: any) {
      if (addError.message && addError.message.includes('already exists')) {
        console.log('ℹ️ Citations column already exists');
      } else {
        throw addError;
      }
    }
    
    // Update existing records
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "Publication" 
        SET "citations" = 0 
        WHERE "citations" IS NULL
      `);
      console.log('✅ Updated existing publications with default citation count');
    } catch (updateError: any) {
      console.log('ℹ️ Update skipped:', updateError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Citations column added successfully! You can now sync publications with citation counts.",
      steps: [
        "✅ Added citations column to Publication table",
        "✅ Set default value to 0 for existing publications",
        "✅ Database schema updated"
      ],
      nextSteps: [
        "Go to Admin → Complete Sync",
        "Click 'Sync Everything Now'",
        "Publications will now include citation counts"
      ]
    });
  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to add citations column",
      error: (error as Error).message,
    }, { status: 500 });
  }
}

// GET - Check migration status
export async function GET() {
  try {
    // Try to query citations column
    await prisma.$queryRaw`SELECT citations FROM "Publication" LIMIT 1`;
    
    return NextResponse.json({
      success: true,
      citationsColumnExists: true,
      message: "Citations column exists and is ready to use",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      citationsColumnExists: false,
      message: "Citations column does not exist yet. Click the button below to add it.",
      error: (error as Error).message,
    });
  }
}
