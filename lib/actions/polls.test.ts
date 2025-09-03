// alx-polly/lib/actions/polls.test.ts
import { createPoll, getPolls, getPoll, updatePoll, deletePoll } from "./polls";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Mock Next.js utilities
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// Define the shape of our mock query builder methods
interface MockQueryBuilder {
  select: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  single: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  upsert: jest.Mock;
  delete: jest.Mock;
  in: jest.Mock;
}

// Define the shape of our mock Supabase client
interface MockSupabaseClient {
  auth: {
    getUser: jest.Mock;
  };
  from: jest.Mock<MockQueryBuilder, [string]>;
}

// Global mock instance that will be reset before each test
let mockSupabase: MockSupabaseClient;

// Factory to create a fresh, chainable mock query builder
const createMockQueryBuilder = (): MockQueryBuilder => {
  const mockQb: MockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn(), // Terminal method, will be resolved dynamically
  };

  // Default resolutions for terminal operations if not specifically overridden
  mockQb.single.mockResolvedValue({ data: null, error: null });
  mockQb.insert.mockResolvedValue({ data: [], error: null });
  mockQb.update.mockResolvedValue({ data: [], error: null });
  mockQb.delete.mockResolvedValue({ data: [], error: null });

  return mockQb;
};

// Mock the createClient module to always return our global mockSupabase instance
// This ensures that `createClient()` inside action functions gets our controllable mock
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe("Poll Actions", () => {
  beforeEach(() => {
    // Initialize mockSupabase with fresh mocks for each test
    // This provides isolation and a clean slate
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };

    // Set a default authenticated user. Individual tests can override this.
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "default-user-id" } },
      error: null,
    });

    // Default `from()` implementation returns a new query builder for each call
    mockSupabase.from.mockImplementation((tableName: string) => {
      const qb = createMockQueryBuilder();
      // Special default for select().order() often used by getPolls
      (qb.order as jest.Mock).mockResolvedValue({ data: [], error: null });
      return qb;
    });

    // Clear all call data on the Next.js utility mocks
    (revalidatePath as jest.Mock).mockClear();
    (redirect as jest.Mock).mockClear();
  });

  describe("createPoll", () => {
    it("should redirect to login if no user is authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const formData = new FormData();
      await createPoll(formData);
      expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("should create a poll and options successfully", async () => {
      const mockUser = { id: "user-123" };
      const mockPoll = {
        id: "poll-456",
        question: "Test Question",
        user_id: "user-123",
      };
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      // Mock from('polls') behavior
      const mockPollsQb = createMockQueryBuilder();
      mockPollsQb.insert.mockReturnThis();
      mockPollsQb.select.mockReturnThis();
      mockPollsQb.single.mockResolvedValueOnce({ data: mockPoll, error: null });

      // Mock from('poll_options') behavior
      const mockOptionsQb = createMockQueryBuilder();
      mockOptionsQb.insert.mockResolvedValueOnce({ data: [], error: null });

      // Route from() calls to the correct query builder mocks
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === "polls") return mockPollsQb;
        if (tableName === "poll_options") return mockOptionsQb;
        return createMockQueryBuilder(); // Fallback
      });

      const formData = new FormData();
      formData.append("question", "Test Question");
      formData.append("option", "Option A");
      formData.append("option", "Option B");

      const result = await createPoll(formData);

      expect(mockSupabase.from).toHaveBeenCalledWith("polls");
      expect(mockPollsQb.insert).toHaveBeenCalledWith({
        question: "Test Question",
        user_id: "user-123",
      });
      expect(mockSupabase.from).toHaveBeenCalledWith("poll_options");
      expect(mockOptionsQb.insert).toHaveBeenCalledWith([
        { poll_id: "poll-456", text: "Option A" },
        { poll_id: "poll-456", text: "Option B" },
      ]);
      expect(revalidatePath).toHaveBeenCalledWith("/polls");
      expect(result).toEqual({ success: true, pollId: "poll-456" });
    });

    it("should handle poll creation error", async () => {
      const mockUser = { id: "user-123" };
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const mockPollsQb = createMockQueryBuilder();
      mockPollsQb.insert.mockReturnThis();
      mockPollsQb.select.mockReturnThis();
      mockPollsQb.single.mockResolvedValueOnce({
        data: null,
        error: { message: "DB Error" },
      });

      mockSupabase.from.mockImplementationOnce((tableName: string) => {
        if (tableName === "polls") return mockPollsQb;
        return createMockQueryBuilder();
      });

      const formData = new FormData();
      formData.append("question", "Test Question");
      formData.append("option", "Option A");

      const result = await createPoll(formData);
      expect(result).toEqual({
        success: false,
        error: "Failed to create poll.",
      });
    });

    it("should handle poll options creation error and delete poll", async () => {
      const mockUser = { id: "user-123" };
      const mockPoll = {
        id: "poll-456",
        question: "Test Question",
        user_id: "user-123",
      };
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const mockPollsQb = createMockQueryBuilder();
      mockPollsQb.insert.mockReturnThis();
      mockPollsQb.select.mockReturnThis();
      mockPollsQb.single.mockResolvedValueOnce({ data: mockPoll, error: null });
      // Mock for cleanup delete if options creation fails
      mockPollsQb.delete.mockReturnThis();
      mockPollsQb.eq.mockResolvedValueOnce({ error: null });

      const mockOptionsQb = createMockQueryBuilder();
      mockOptionsQb.insert.mockResolvedValueOnce({
        data: null,
        error: { message: "Option DB Error" },
      });

      // Sequence the calls to mockSupabase.from
      mockSupabase.from
        .mockImplementationOnce((tableName: string) => { // 1. from("polls") for insert
          if (tableName === "polls") return mockPollsQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // 2. from("poll_options") for insert (error)
          if (tableName === "poll_options") return mockOptionsQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // 3. from("polls") for delete (cleanup)
          if (tableName === "polls") return mockPollsQb;
          return createMockQueryBuilder();
        });

      const formData = new FormData();
      formData.append("question", "Test Question");
      formData.append("option", "Option A");

      const result = await createPoll(formData);

      expect(mockOptionsQb.insert).toHaveBeenCalled();
      expect(mockPollsQb.delete).toHaveBeenCalledWith(); // Expect delete to be called
      expect(mockPollsQb.eq).toHaveBeenCalledWith("id", "poll-456"); // Then eq is chained
      expect(result).toEqual({
        success: false,
        error: "Failed to create poll options.",
      });
    });
  });

  describe("getPolls", () => {
    it("should fetch all polls", async () => {
      const mockPolls = [
        {
          id: "1",
          question: "Q1",
          user_id: "user-123",
          created_at: "now",
          poll_options: [],
        },
      ];
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const mockPollsQb = createMockQueryBuilder();
      mockPollsQb.select.mockReturnThis();
      mockPollsQb.order.mockResolvedValueOnce({ data: mockPolls, error: null });
      mockSupabase.from.mockReturnValueOnce(mockPollsQb);

      const result = await getPolls();
      expect(result).toEqual([
        {
          id: "1",
          question: "Q1",
          user_id: "user-123",
          created_at: "now",
          poll_options: [],
          isOwner: false,
        },
      ]);
    });

    it("should mark isOwner correctly for authenticated user", async () => {
      const mockUser = { id: "user-123" };
      const mockPolls = [
        {
          id: "1",
          question: "Q1",
          user_id: "user-123",
          created_at: "now",
          poll_options: [],
        },
        {
          id: "2",
          question: "Q2",
          user_id: "user-456",
          created_at: "now",
          poll_options: [],
        },
      ];
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const mockPollsQb = createMockQueryBuilder();
      mockPollsQb.select.mockReturnThis();
      mockPollsQb.order.mockResolvedValueOnce({ data: mockPolls, error: null });
      mockSupabase.from.mockReturnValueOnce(mockPollsQb);

      const result = await getPolls();
      expect(result).toEqual([
        {
          id: "1",
          question: "Q1",
          user_id: "user-123",
          created_at: "now",
          poll_options: [],
          isOwner: true,
        },
        {
          id: "2",
          question: "Q2",
          user_id: "user-456",
          created_at: "now",
          poll_options: [],
          isOwner: false,
        },
      ]);
    });

    it("should handle error fetching polls", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const mockPollsQb = createMockQueryBuilder();
      mockPollsQb.select.mockReturnThis();
      mockPollsQb.order.mockResolvedValueOnce({
        data: null,
        error: { message: "DB Error" },
      });
      mockSupabase.from.mockReturnValueOnce(mockPollsQb);

      const result = await getPolls();
      expect(result).toEqual([]);
    });
  });

  describe("getPoll", () => {
    it("should fetch a single poll by ID", async () => {
      const mockPoll = {
        id: "poll-123",
        question: "Test Question",
        poll_options: [],
      };

      const mockPollsQb = createMockQueryBuilder();
      mockPollsQb.select.mockReturnThis();
      mockPollsQb.eq.mockReturnThis();
      mockPollsQb.single.mockResolvedValueOnce({ data: mockPoll, error: null });
      mockSupabase.from.mockReturnValueOnce(mockPollsQb);

      const result = await getPoll("poll-123");
      expect(result).toEqual(mockPoll);
    });

    it("should return null if poll not found or error occurs", async () => {
      const mockPollsQb = createMockQueryBuilder();
      mockPollsQb.select.mockReturnThis();
      mockPollsQb.eq.mockReturnThis();
      mockPollsQb.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found" },
      });
      mockSupabase.from.mockReturnValueOnce(mockPollsQb);

      const result = await getPoll("non-existent-poll");
      expect(result).toBeNull();
    });
  });

  describe("updatePoll", () => {
    const mockPollId = "poll-123";
    const mockUserId = "user-123";

    it("should return error if user not logged in", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });
      const result = await updatePoll(mockPollId, {
        question: "New Question",
        options: [],
      });
      expect(result).toEqual({
        success: false,
        error: "You must be logged in to update a poll.",
      });
    });

    it("should return error if user not authorized to edit poll", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: "wrong-user" } },
        error: null,
      });

      const mockPollsQb = createMockQueryBuilder();
      mockPollsQb.select.mockReturnThis();
      mockPollsQb.eq.mockReturnThis();
      mockPollsQb.single.mockResolvedValueOnce({
        data: { user_id: mockUserId },
        error: null,
      });
      mockSupabase.from.mockReturnValueOnce(mockPollsQb);

      const result = await updatePoll(mockPollId, {
        question: "New Question",
        options: [],
      });
      expect(result).toEqual({
        success: false,
        error: "You are not authorized to edit this poll.",
      });
    });

    it("should update poll question successfully", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: mockUserId } },
        error: null,
      });

      // Create and configure mock query builders for polls table
      const mockPollsOwnershipQb = createMockQueryBuilder();
      mockPollsOwnershipQb.eq.mockReturnThis();
      mockPollsOwnershipQb.eq.mockReturnValue(mockPollsOwnershipQb);
      mockPollsOwnershipQb.single.mockResolvedValueOnce({
        data: { user_id: mockUserId },
        error: null,
      });

      const mockPollsUpdateQb = createMockQueryBuilder();
      mockPollsUpdateQb.update.mockReturnThis();
      mockPollsUpdateQb.eq.mockResolvedValueOnce({ error: null });

      // Create and configure mock query builder for poll_options table (for options deletion check)
      const mockOptionsExistingQb = createMockQueryBuilder();
      mockOptionsExistingQb.select.mockReturnThis(); // For select('id')
      mockOptionsExistingQb.eq.mockReturnThis(); // For eq('poll_id', pollId)
      mockOptionsExistingQb.select.mockResolvedValueOnce({
        data: [],
        error: null,
      }); // For the actual fetch of existing options

      const mockOptionsDeleteQb = createMockQueryBuilder(); // For the actual delete call
      mockOptionsDeleteQb.delete.mockReturnThis();
      mockOptionsDeleteQb.in.mockResolvedValueOnce({ error: null });

      // Sequence the calls to mockSupabase.from
      mockSupabase.from
        .mockImplementationOnce((tableName: string) => { // First call: from("polls") for ownership check
          if (tableName === "polls") return mockPollsOwnershipQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // Second call: from("polls") for update poll question
          if (tableName === "polls") return mockPollsUpdateQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // Third call: from("poll_options") for fetching existing options for deletion
          if (tableName === "poll_options") return mockOptionsExistingQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // Fourth call: from("poll_options") for deleting old options
          if (tableName === "poll_options") return mockOptionsDeleteQb;
          return createMockQueryBuilder();
        });

      const result = await updatePoll(mockPollId, {
        question: "New Question",
        options: [],
      });
      // Assertions
      expect(mockPollsOwnershipQb.single).toHaveBeenCalled();
      expect(mockPollsUpdateQb.update).toHaveBeenCalledWith({
        question: "New Question",
      });
      expect(mockOptionsExistingQb.select).toHaveBeenCalledWith("id"); // Verify the select call for deletion logic
      expect(mockOptionsExistingQb.eq).toHaveBeenCalledWith(
        "poll_id",
        mockPollId,
      );
      expect(mockOptionsDeleteQb.delete).toHaveBeenCalledWith(); // Ensure delete is called on the correct QB
      expect(mockOptionsDeleteQb.in).toHaveBeenCalledWith("id", []); // Expect in to be called with an empty array if no options to delete
      expect(revalidatePath).toHaveBeenCalledWith("/polls");
      expect(revalidatePath).toHaveBeenCalledWith(`/polls/${mockPollId}`);
      expect(revalidatePath).toHaveBeenCalledWith(`/polls/${mockPollId}/edit`);
      expect(result).toEqual({ success: true });
    });

    it("should handle new, updated, and deleted options", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: mockUserId } },
        error: null,
      });

      // Mock query builder for 'polls' table
      const mockPollsOwnershipQb = createMockQueryBuilder();
      mockPollsOwnershipQb.select.mockReturnThis();
      mockPollsOwnershipQb.eq.mockReturnThis();
      mockPollsOwnershipQb.single.mockResolvedValueOnce({
        data: { user_id: mockUserId },
        error: null,
      });

      const mockPollsUpdateQb = createMockQueryBuilder();
      mockPollsUpdateQb.update.mockReturnThis();
      mockPollsUpdateQb.eq.mockResolvedValueOnce({ error: null });

      // Mock query builder for 'poll_options' table
      const mockOptionsInsertQb = createMockQueryBuilder();
      mockOptionsInsertQb.insert.mockReturnThis();
      mockOptionsInsertQb.select.mockResolvedValueOnce({ // For insert().select()
        data: [{ id: "new-opt-1", text: "Brand New Option" }],
        error: null,
      });

      const mockOptionsUpsertQb = createMockQueryBuilder();
      mockOptionsUpsertQb.upsert.mockResolvedValueOnce({ error: null });

      const mockOptionsExistingQb = createMockQueryBuilder();
      mockOptionsExistingQb.select.mockReturnThis(); // For select('id')
      mockOptionsExistingQb.eq.mockReturnThis(); // For eq('poll_id', pollId)
      mockOptionsExistingQb.select.mockResolvedValueOnce({ // For actual fetch of existing options
        data: [{ id: "opt-to-delete" }, { id: "opt-to-keep" }],
        error: null,
      });

      const mockOptionsDeleteQb = createMockQueryBuilder();
      mockOptionsDeleteQb.delete.mockReturnThis();
      mockOptionsDeleteQb.in.mockResolvedValueOnce({ error: null });

      // Sequence the calls to mockSupabase.from
      mockSupabase.from
        .mockImplementationOnce((tableName: string) => { // 1. from("polls") for ownership
          if (tableName === "polls") return mockPollsOwnershipQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // 2. from("polls") for update question
          if (tableName === "polls") return mockPollsUpdateQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // 3. from("poll_options") for insert new options
          if (tableName === "poll_options") return mockOptionsInsertQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // 4. from("poll_options") for upsert existing options
          if (tableName === "poll_options") return mockOptionsUpsertQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // 5. from("poll_options") for fetching existing for deletion
          if (tableName === "poll_options") return mockOptionsExistingQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // 6. from("poll_options") for deleting old options
          if (tableName === "poll_options") return mockOptionsDeleteQb;
          return createMockQueryBuilder();
        });

      const newOptionsData = [
        { id: "_new_1", text: "Brand New Option" },
        { id: "opt-to-keep", text: "Updated Existing Option" },
      ];

      const result = await updatePoll(mockPollId, {
        question: "Updated Question",
        options: newOptionsData,
      });

      // Assertions
      expect(mockPollsOwnershipQb.single).toHaveBeenCalled();
      expect(mockPollsUpdateQb.update).toHaveBeenCalledWith({
        question: "Updated Question",
      });
      expect(mockOptionsInsertQb.insert).toHaveBeenCalledWith([
        { poll_id: mockPollId, text: "Brand New Option" },
      ]);
      expect(mockOptionsInsertQb.select).toHaveBeenCalled(); // After insert
      expect(mockOptionsUpsertQb.upsert).toHaveBeenCalledWith([
        {
          id: "opt-to-keep",
          poll_id: mockPollId,
          text: "Updated Existing Option",
        },
      ]);
      expect(mockOptionsExistingQb.select).toHaveBeenCalledWith("id");
      expect(mockOptionsExistingQb.eq).toHaveBeenCalledWith(
        "poll_id",
        mockPollId,
      );
      expect(mockOptionsDeleteQb.delete).toHaveBeenCalledWith();
      expect(mockOptionsDeleteQb.in).toHaveBeenCalledWith("id", [
        "opt-to-delete",
      ]);
      // Also expect revalidate paths
      expect(revalidatePath).toHaveBeenCalledWith("/polls");
      expect(revalidatePath).toHaveBeenCalledWith(`/polls/${mockPollId}`);
      expect(revalidatePath).toHaveBeenCalledWith(`/polls/${mockPollId}/edit`);
      expect(result).toEqual({ success: true });
    });

    it("should handle poll question update error", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: mockUserId } },
        error: null,
      });

      // Mock for ownership check
      const mockPollsOwnershipQb = createMockQueryBuilder();
      mockPollsOwnershipQb.select.mockReturnThis();
      mockPollsOwnershipQb.eq.mockReturnThis();
      mockPollsOwnershipQb.single.mockResolvedValueOnce({
        data: { user_id: mockUserId },
        error: null,
      });

      // Mock for updating question (error case)
      const mockPollsUpdateQb = createMockQueryBuilder();
      mockPollsUpdateQb.update.mockReturnThis();
      mockPollsUpdateQb.eq.mockResolvedValueOnce({
        error: { message: "Update Error" },
      });

      // Sequence the calls to mockSupabase.from
      mockSupabase.from
        .mockImplementationOnce((tableName: string) => { // 1. from("polls") for ownership
          if (tableName === "polls") return mockPollsOwnershipQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // 2. from("polls") for update question
          if (tableName === "polls") return mockPollsUpdateQb;
          return createMockQueryBuilder();
        });

      const result = await updatePoll(mockPollId, {
        question: "New Question",
        options: [],
      });
      // Assertions
      expect(mockPollsOwnershipQb.single).toHaveBeenCalled();
      expect(mockPollsUpdateQb.update).toHaveBeenCalledWith({
        question: "New Question",
      });
      expect(result).toEqual({
        success: false,
        error: "Failed to update poll question.",
      });
    });

    it("should handle new options insertion error", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: mockUserId } },
        error: null,
      });

      // Mock for ownership check
      const mockPollsOwnershipQb = createMockQueryBuilder();
      mockPollsOwnershipQb.select.mockReturnThis();
      mockPollsOwnershipQb.eq.mockReturnThis();
      mockPollsOwnershipQb.single.mockResolvedValueOnce({
        data: { user_id: mockUserId },
        error: null,
      });

      // Mock for updating question
      const mockPollsUpdateQb = createMockQueryBuilder();
      mockPollsUpdateQb.update.mockReturnThis();
      mockPollsUpdateQb.eq.mockResolvedValueOnce({ error: null });

      // Mock for insert new options (error case)
      const mockOptionsInsertQb = createMockQueryBuilder();
      mockOptionsInsertQb.insert.mockReturnThis();
      mockOptionsInsertQb.select.mockResolvedValueOnce({ // For insert().select()
        data: null,
        error: { message: "Insert Error" },
      });

      // Sequence the calls to mockSupabase.from
      mockSupabase.from
        .mockImplementationOnce((tableName: string) => { // 1. from("polls") for ownership
          if (tableName === "polls") return mockPollsOwnershipQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // 2. from("polls") for update question
          if (tableName === "polls") return mockPollsUpdateQb;
          return createMockQueryBuilder();
        })
        .mockImplementationOnce((tableName: string) => { // 3. from("poll_options") for insert new options
          if (tableName === "poll_options") return mockOptionsInsertQb;
          return createMockQueryBuilder();
        });

      const newOptionsData = [{ id: "_new_1", text: "Brand New Option" }];
      const result = await updatePoll(mockPollId, {
        question: "Updated Question",
        options: newOptionsData,
      });
      // Assertions
      expect(mockPollsOwnershipQb.single).toHaveBeenCalled();
      expect(mockPollsUpdateQb.update).toHaveBeenCalledWith({
        question: "Updated Question",
      });
      expect(mockOptionsInsertQb.insert).toHaveBeenCalledWith([
        { poll_id: mockPollId, text: "Brand New Option" },
      ]);
      expect(mockOptionsInsertQb.select).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: "Failed to add new options.",
      });
    });
  });

  describe("deletePoll", () => {
    it("should delete a poll successfully", async () => {
      const mockPollsQb = createMockQueryBuilder();
      mockPollsQb.delete.mockReturnThis();
      mockPollsQb.eq.mockResolvedValueOnce({ error: null });
      mockSupabase.from.mockReturnValueOnce(mockPollsQb);

      const result = await deletePoll("poll-123");
      expect(mockPollsQb.delete).toHaveBeenCalledWith(); // Expect delete to be called
      expect(mockPollsQb.eq).toHaveBeenCalledWith("id", "poll-123"); // Then eq is chained
      expect(revalidatePath).toHaveBeenCalledWith("/polls");
      expect(result).toEqual({ success: true });
    });

    it("should handle poll deletion error", async () => {
      const mockPollsQb = createMockQueryBuilder();
      mockPollsQb.delete.mockReturnThis();
      mockPollsQb.eq.mockResolvedValueOnce({
        error: { message: "Delete Error" },
      });
      mockSupabase.from.mockReturnValueOnce(mockPollsQb);

      const result = await deletePoll("poll-123");
      expect(result).toEqual({
        success: false,
        error: "Failed to delete poll.",
      });
    });
  });
});
