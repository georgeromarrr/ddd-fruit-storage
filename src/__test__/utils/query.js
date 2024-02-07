const gql = require("graphql-tag");

const FIND_FRUIT_QUERY = gql`
  query FindFruit($name: String!) {
    findFruit(name: $name) {
      status
      message
      data {
        id
        name
        description
        amount
        limitOfFruitToBeStored
      }
    }
  }
`;

const GET_STORAGE_QUERY = gql`
  query GetFruitStorage {
    getFruitStorage {
      status
      message
      data {
        id
        name
        description
        amount
        limitOfFruitToBeStored
      }
    }
  }
`;

const CREATE_FRUIT_MUTATION = gql`
  mutation CreateFruitForFruitStorage($name: String!, $description: String, $limitOfFruitToBeStored: Int) {
    createFruitForFruitStorage(name: $name, description: $description, limitOfFruitToBeStored: $limitOfFruitToBeStored) {
      status
      message
      data {
        id
        name
        description
        amount
        limitOfFruitToBeStored
      }
    }
  }
`;

const STORE_FRUIT_MUTATION = gql`
  mutation StoreFruitToFruitStorage($name: String!, $amount: Int) {
    storeFruitToFruitStorage(name: $name, amount: $amount) {
      status
      message
      data {
        id
        name
        description
        amount
        limitOfFruitToBeStored
      }
    }
  }
`;

const REMOVE_FRUIT_MUTATION = gql`
  mutation RemoveFruitFromFruitStorage($name: String!, $amount: Int) {
    removeFruitFromFruitStorage(name: $name, amount: $amount) {
      status
      message
      data {
        id
        name
        description
        amount
        limitOfFruitToBeStored
      }
    }
  }
`;

const UDPATE_FRUIT_MUTATION = gql`
  mutation UpdateFruitForFruitStorage($name: String!, $description: String, $limitOfFruitToBeStored: Int) {
    updateFruitForFruitStorage(name: $name, description: $description, limitOfFruitToBeStored: $limitOfFruitToBeStored) {
      status
      message
      data {
        id
        name
        description
        amount
        limitOfFruitToBeStored
      }
    }
  }
`;

const DELETE_FRUIT_MUTATION = gql`
  mutation DeleteFruitFromFruitStorage($name: String!, $forceDelete: Boolean) {
    deleteFruitFromFruitStorage(name: $name, forceDelete: $forceDelete) {
      status
      message
      data {
        id
        name
        description
        amount
        limitOfFruitToBeStored
      }
    }
  }
`;

module.exports = {
  FIND_FRUIT_QUERY,
  GET_STORAGE_QUERY,
  CREATE_FRUIT_MUTATION,
  STORE_FRUIT_MUTATION,
  REMOVE_FRUIT_MUTATION,
  UDPATE_FRUIT_MUTATION,
  DELETE_FRUIT_MUTATION,
};
