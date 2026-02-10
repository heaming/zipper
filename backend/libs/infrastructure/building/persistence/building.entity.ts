import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('buildings')
@Index(['city', 'district', 'neighborhood'])
@Index(['roadAddress'])
@Index(['lotAddress'])
@Index(['postalCode'])
export class BuildingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // 건물명 (예: "래미안아파트")

  @Column()
  type: string; // 'apartment', 'villa', 'officetel', 'house', 'commercial'

  // === 행정구역 ===
  @Column()
  city: string; // 시/도 (예: "서울특별시")

  @Column()
  district: string; // 시/군/구 (예: "강남구")

  @Column()
  neighborhood: string; // 읍/면/동 (예: "역삼동")

  @Column({ nullable: true })
  village: string; // 리 (시골 지역에서 사용, 선택적)

  // === 도로명 주소 ===
  @Column({ nullable: true })
  roadName: string; // 도로명 (예: "테헤란로")

  @Column({ nullable: true })
  roadNumber: string; // 건물번호 (예: "123")

  @Column({ nullable: true })
  roadAddress: string; // 전체 도로명주소 (예: "서울특별시 강남구 테헤란로 123")

  // === 지번 주소 ===
  @Column({ nullable: true })
  lotNumber: string; // 지번 (예: "123-45")

  @Column({ nullable: true })
  lotAddress: string; // 전체 지번주소 (예: "서울특별시 강남구 역삼동 123-45")

  // === 건물 상세 정보 ===
  @Column({ nullable: true })
  buildingCode: string; // 건물관리번호 (행정안전부 고유번호)

  @Column({ nullable: true })
  postalCode: string; // 우편번호 (예: "06234")

  // === 위치 정보 ===
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number; // 위도

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number; // 경도

  // === 통계 및 상태 ===
  @Column({ default: 0 })
  userCount: number; // 입주민 수

  @Column({ default: 0 })
  totalHouseholds: number; // 총 세대수

  @Column({ default: true })
  isActive: boolean; // 활성화 여부

  @Column({ default: false })
  isVerified: boolean; // 관리자 검증 완료 여부

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
