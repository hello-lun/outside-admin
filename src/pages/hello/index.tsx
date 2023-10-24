import React from 'react';
import styled from '@emotion/styled';

export default function hello() {
  return (
    <Container>
      <div id='sd'>sdfdf</div>
      我是hello页面
    </Container>
  );
}

const Container = styled.div`
  width: 500px;
  height: 500px;
  background-color: pink;
`;
