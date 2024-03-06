// StyledComponents.js
import styled from 'styled-components';

// Styled components
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
`;

export const Input = styled.input`
  padding: 10px;
  margin: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 250px;
`;

export const Button = styled.button`
  padding: 10px 20px;
  margin: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

export const Spacer = styled.div`
  height: 20px;
`;

export const Title = styled.h2`
  color: #333;
  font-size: 2em;
  margin-bottom: 0.3em;
`;

export const Text = styled.p`
  color: #666;
  font-size: 1em;
  margin: 5px 0;
`;

export const List = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 500px;
`;

export const ListItem = styled.li`
  background-color: #f7f7f7; 
  color: #333; 
  border: 1px solid #ddd;
  padding: 10px 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

