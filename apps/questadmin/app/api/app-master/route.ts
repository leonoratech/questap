import { AppMasterRepository } from '@/data/repository/app-master-repository';
import { authenticateRequest } from '@/lib/jwt-utils';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/app-master
 * Retrieve the appMaster configuration including college information
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Get appMaster data
    const appMaster = await AppMasterRepository.getAppMaster();
    
    if (!appMaster) {
      return NextResponse.json(
        { error: 'AppMaster configuration not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(appMaster);
  } catch (error) {
    console.error('Error fetching appMaster:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appMaster configuration' }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/app-master
 * Update the college information in appMaster (superadmin only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Check if user is superadmin
    if (authResult.user?.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only superadmins can update college information.' }, 
        { status: 403 }
      );
    }

    const body = await request.json();
    const { college } = body;

    if (!college) {
      return NextResponse.json(
        { error: 'College data is required' }, 
        { status: 400 }
      );
    }

    // Update college information
    await AppMasterRepository.updateCollege(college);

    // Return updated data
    const updatedAppMaster = await AppMasterRepository.getAppMaster();
    
    return NextResponse.json(updatedAppMaster);
  } catch (error) {
    console.error('Error updating appMaster:', error);
    return NextResponse.json(
      { error: 'Failed to update college information' }, 
      { status: 500 }
    );
  }
}
