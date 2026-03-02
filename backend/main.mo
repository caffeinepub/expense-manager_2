import Int "mo:core/Int";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Expense = {
    id : Int;
    title : Text;
    description : Text;
    price : Float;
    category : Text;
    timestamp : Time.Time;
  };

  type Summary = {
    totalExpense : Float;
    expenseCount : Nat;
    highestExpense : ?Float;
    lowestExpense : ?Float;
    categoryBreakdown : [(Text, Float)];
  };

  type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextId = 0;

  let expenses = Map.empty<Int, Expense>();

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addExpense(title : Text, description : Text, price : Float, category : Text) : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add expenses");
    };

    if (title.size() == 0) {
      Runtime.trap("Title must not be empty");
    };

    if (price <= 0) {
      Runtime.trap("Price must be positive");
    };

    let id = nextId;
    nextId += 1;

    let expense : Expense = {
      id;
      title;
      description;
      price;
      category;
      timestamp = Time.now();
    };

    expenses.add(id, expense);
    id;
  };

  public query ({ caller }) func getExpenses() : async [Expense] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };
    expenses.values().toArray();
  };

  public shared ({ caller }) func deleteExpense(id : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete expenses");
    };

    if (not expenses.containsKey(id)) {
      Runtime.trap("Expense not found");
    };
    expenses.remove(id);
  };

  public query ({ caller }) func getSummary() : async Summary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view summary");
    };

    let expensesArray = expenses.values().toArray();

    let totalExpense = expensesArray.foldLeft(0.0, func(acc, exp) { acc + exp.price });

    let expenseCount = expensesArray.size();

    let highestExpense : ?Float = findExtreme(expensesArray, func(a, b) { a > b });

    let lowestExpense : ?Float = findExtreme(expensesArray, func(a, b) { a < b });

    let categoryBreakdown = calculateCategoryBreakdown(expensesArray);

    {
      totalExpense;
      expenseCount;
      highestExpense;
      lowestExpense;
      categoryBreakdown;
    };
  };

  func findExtreme(expensesArray : [Expense], compare : (Float, Float) -> Bool) : ?Float {
    if (expensesArray.size() == 0) {
      return null;
    };

    var extremeValue = expensesArray[0].price;

    for (expense in expensesArray.values()) {
      if (compare(expense.price, extremeValue)) {
        extremeValue := expense.price;
      };
    };

    ?extremeValue;
  };

  func calculateCategoryBreakdown(expensesArray : [Expense]) : [(Text, Float)] {
    let categories = [
      "Movies",
      "Gadgets",
      "Clothes",
      "Food",
      "Travel",
      "Health",
      "Education",
      "Other",
    ];
    let breakdown = Map.empty<Text, Float>();

    for (category in categories.values()) {
      breakdown.add(category, 0.0);
    };

    for (expense in expensesArray.values()) {
      switch (breakdown.get(expense.category)) {
        case (?sum) {
          breakdown.add(expense.category, sum + expense.price);
        };
        case (null) {
          breakdown.add(expense.category, expense.price);
        };
      };
    };

    breakdown.toArray();
  };
};
