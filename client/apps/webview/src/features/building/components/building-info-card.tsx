'use client'

import { Card, CardContent, CardHeader, CardTitle, Divider } from '@ui/index'

interface BuildingInfoCardProps {
  buildingName: string
  address: string
  buildingType: 'APARTMENT' | 'OFFICETEL' | 'VILLA'
  memberCount: number
  inviteCode: string
}

const buildingTypeLabels = {
  APARTMENT: '아파트',
  OFFICETEL: '오피스텔',
  VILLA: '빌라',
}

export default function BuildingInfoCard({
  buildingName,
  address,
  buildingType,
  memberCount,
  inviteCode,
}: BuildingInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>내 건물 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-sm text-text-secondary mb-1">건물명</div>
          <div className="font-semibold text-text-primary">{buildingName}</div>
        </div>

        <Divider />

        <div>
          <div className="text-sm text-text-secondary mb-1">주소</div>
          <div className="text-sm text-text-primary">{address}</div>
        </div>

        <Divider />

        <div className="flex justify-between">
          <div>
            <div className="text-sm text-text-secondary mb-1">건물 유형</div>
            <div className="text-sm text-text-primary">
              {buildingTypeLabels[buildingType]}
            </div>
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-1">멤버 수</div>
            <div className="text-sm text-text-primary">{memberCount}명</div>
          </div>
        </div>

        <Divider />

        <div>
          <div className="text-sm text-text-secondary mb-1">초대 코드</div>
          <div className="font-mono text-lg font-bold text-primary">
            {inviteCode}
          </div>
          <p className="text-xs text-text-tertiary mt-1">
            이 코드로 같은 건물 이웃을 초대할 수 있어요
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
