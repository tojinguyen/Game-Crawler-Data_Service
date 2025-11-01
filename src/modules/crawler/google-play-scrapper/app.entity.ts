import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class App {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appId: string;

  @Column()
  title: string;

  @Column()
  developer: string;

  @Column({ nullable: true })
  score: number;

  @CreateDateColumn()
  crawledAt: Date;
}
