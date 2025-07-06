import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum NotificationType {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  SUCCESS = "success",
  CUSTOM = "custom",
}

@Entity("notifications")
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  @Index()
  userId?: string; // Pour les notifications privées

  @Column({ nullable: true })
  @Index()
  channel?: string; // Pour les notifications de groupe/public

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "text", nullable: true })
  content?: string;

  @Column({
    type: "text",
    default: NotificationType.INFO,
  })
  type!: NotificationType;

  @Column({ type: "varchar", nullable: true })
  link?: string; // Lien vers une ressource associée

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, any>; // Pour passer des IDs, chemins, etc.

  @Column({ type: "datetime", nullable: true })
  @Index()
  expiresAt?: Date;

  @Column({ type: "datetime", nullable: true })
  @Index()
  scheduledAt?: Date;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ default: false })
  isArchived!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true, type: "datetime" })
  readAt?: Date;
}
