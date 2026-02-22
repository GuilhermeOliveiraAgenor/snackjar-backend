import { UniqueEntityID } from "../domain/value-objects/unique-entity-id";
import { AuthProvider } from "../enum/AuthProvider";
import { Optional } from "../types/optional";

export interface UserProps {
  // create interface
  name: string;
  email: string;
  password: string | null;
  googleId?: string | null;
  provider: AuthProvider;
  createdAt: Date;
  updatedAt: Date | null;
}

export class User {
  constructor(
    private readonly _id: UniqueEntityID, // create id
    private props: UserProps, // import fields props
  ) {}

  static create(
    props: Optional<UserProps, "createdAt" | "updatedAt" | "password" | "googleId">,
    id?: UniqueEntityID,
  ) {
    const user = new User(id ?? new UniqueEntityID(), {
      ...props,
      password: props.password ?? null,
      googleId: props.googleId ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
    });

    return user;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get password(): string | null {
    return this.props.password;
  }

  get googleId(): string | null | undefined {
    return this.props.googleId;
  }

  get provider() {
    return this.props.provider;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  set email(email: string) {
    this.props.email = email;
    this.touch();
  }

  set password(password: string) {
    this.props.password = password;
    this.touch();
  }

  set googleId(googleId: string) {
    this.props.googleId = googleId;
    this.touch();
  }

  set provider(provider: AuthProvider) {
    this.props.provider = provider;
    this.touch();
  }
  set createdAt(createdAt: Date) {
    this.props.createdAt = createdAt;
    this.touch();
  }

  set updatedAt(updatedAt: Date) {
    this.props.updatedAt = updatedAt;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
