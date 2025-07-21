import dbConnect from './dbConnect';
import { Adapter, AdapterUser, AdapterAccount } from 'next-auth/adapters';
import { User } from './models/User';
import { Types } from 'mongoose';

function toAdapterUser(user: any): AdapterUser | null {
  if (!user) return null;
  return {
    id: user._id?.toString() || user.id?.toString() || '',
    email: user.email,
    emailVerified: user.emailVerified || null,
    name: user.name || '',
    image: user.image || null,
  };
}

export function CustomAdapter(): Adapter {
  return {
    async getUser(id: string) {
      await dbConnect();
      const user = await User.findById(id).lean();
      return toAdapterUser(user);
    },
    async getUserByEmail(email: string) {
      await dbConnect();
      const user = await User.findOne({ email }).lean();
      return toAdapterUser(user);
    },
    async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      await dbConnect();
      const user = await User.findOne({ 'oauthAccounts.provider': provider, 'oauthAccounts.providerAccountId': providerAccountId }).lean();
      return toAdapterUser(user);
    },
    async createUser(user: AdapterUser) {
      await dbConnect();
      const [firstName, ...rest] = (user.name || '').split(' ');
      const lastName = rest.join(' ');
      const newUser = {
        email: user.email,
        name: user.name,
        image: user.image,
        oauthAccounts: [],
        personalInfo: {
          firstName: firstName || 'First',
          lastName: lastName || 'Last',
          summary: 'Professional summary will be added here.',
          contactInfo: {
            email: user.email || '',
            phone: '',
            location: '',
            linkedin: '',
            github: '',
            website: ''
          }
        },
        workExperience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        awards: [],
        publications: [],
        volunteerExperience: [],
        interests: [],
        references: [],
        resumes: [],
        preferences: {},
        analytics: {},
      };
      const created = await User.create(newUser);
      return toAdapterUser(created.toObject());
    },
    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      await dbConnect();
      const updated = await User.findByIdAndUpdate(user.id, user, { new: true }).lean();
      return toAdapterUser(updated);
    },
    async linkAccount(account: AdapterAccount) {
      await dbConnect();
      await User.findByIdAndUpdate(account.userId, {
        $push: { oauthAccounts: account }
      });
      return account;
    },
    // ...implement other required methods as needed
  };
} 