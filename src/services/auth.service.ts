import Manager, { IManager } from "../models/Managers.model";

class AuthService {
    async addNewManager (data: IManager): Promise<Partial<IManager>>{
  // Check if Manager already exists
  const existingManager = await Manager.findOne({ email: data.email });
  if (existingManager) {
    // return next(new AppError('manager already exists', 400));
  }
    }
    async getManager(data: Partial<IManager>): Promise<IManager | null>{

        // const manager = await Manager.findOne({$or: {email: data.email}, })
return null
    }
}