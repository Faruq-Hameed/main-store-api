import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@/exceptions";
import Manager, { IManager } from "@/models/Manager";
import { ILogin } from "@/types";

class AuthService {
    async addNewManager(data: IManager): Promise<Partial<IManager>> {
        // Check if Manager already exists
        const existingManager = await this.getAManager({ email: data.email }, 'email');
        if (existingManager) {
            throw new ConflictException(`Manager with the email: ${data.email} already exists`)
        }
        const manager = await Manager.create(data)
        manager.password = '' //clear password field
        return manager;
    }

    async getAManager(query: Record<string, any>,
        select?: string,): Promise<IManager | null> {
        return await Manager.findOne(query, select)
    }

    async managerLogin(data: ILogin): Promise<IManager> {
        // Check if manager exists
        const manager = await this.getAManager({ email: data.email }, '+password');
        if (!manager) {
            throw new NotFoundException(`Manager with email ${data.email} not found in the system`)
        }
        // Check if password matches
        const isPasswordMatch = await manager.comparePassword(data.password);
        if (!isPasswordMatch) {
            throw new BadRequestException('Invalid login credentials')
        }
        manager.password = '';
        return manager

    }

}

export default new AuthService();
